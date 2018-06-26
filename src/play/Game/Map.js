import * as THREE from 'three'

import store from '@/xjs/store'

import render from '@/play/render'

import Creep from '@/play/Game/entity/Creep'
import Tower from '@/play/Game/entity/Tower'

const TILE_SIZE = 32
const TILES_WIDE = 22
const TILES_TALL = 18
const MAP_WIDTH = TILE_SIZE * TILES_WIDE
const MAP_HEIGHT = TILE_SIZE * TILES_TALL
const TOTAL_TILES = TILES_WIDE * TILES_TALL

const MIN_X = -MAP_WIDTH / 2 + TILE_SIZE * 2
const MIN_Y = -MAP_HEIGHT / 2 + TILE_SIZE * 2
const MAX_X = MAP_WIDTH / 2 - TILE_SIZE * 2
const MAX_Y = MAP_HEIGHT / 2 - TILE_SIZE * 2

const BLOCK_CHECK = [0, -1, -TILES_WIDE, 1]

const ENTRANCE_SIZE = 6
const EX = 0
const EY = 1

const tileArray = () => {
	return new Array(TOTAL_TILES)
}

export default class GameMap {

	constructor (parent) {
		store.state.game.wave = 0

		const EH = ENTRANCE_SIZE / 2
		const TWH = TILES_WIDE / 2
		const TTH = TILES_TALL / 2

		this.container = render.group(parent)
		this.container.interactive = true

		this.blocked = tileArray()
		this.test = [ tileArray(), tileArray() ]
		this.entrances = [ this.entrance(true, false), this.entrance(true, true) ]
		this.exits = [ this.entrance(false, false), this.entrance(false, true) ]
		this.ordinals = [
			[ [1, 0], [0, -TILES_WIDE], [-1, 0], [0, TILES_WIDE] ],
			[ [1, -TILES_WIDE], [-1, -TILES_WIDE], [-1, TILES_WIDE], [1, TILES_WIDE] ],
		]

		let blockCol = 1, blockRow = 1
		for (let idx = 0; idx < TOTAL_TILES; idx += 1) {
			let isBlocked = false
			if (blockCol === 1 || blockCol === TILES_WIDE) {
				isBlocked = blockRow <= TTH - EH + EY || blockRow > TTH + EH + EY
			} else if (blockRow === 1 || blockRow === TILES_TALL) {
				isBlocked = blockCol <= TWH - EH + EX || blockCol > TWH + EH + EX
			}
			this.blocked[idx] = isBlocked
			if (blockCol < TILES_WIDE) {
				blockCol += 1
			} else {
				blockRow += 1
				blockCol = 1
			}
		}
		this.updatePaths(false)

		const ground = render.rectangle(MAP_WIDTH, MAP_HEIGHT, { color: 0xccbb99, parent: this.container })
		ground.owner = ground

		const walls = [
			[ 0,              0,              1,             TTH - EH - EY ],
			[ 0,              0,              TWH - EH + EX, 1             ],
			[ 0,              TTH + EH - EY,  1,             TTH - EH + EY ],
			[ TWH + EH + EX,  0,              TWH - EH - EX, 1             ],
			[ 0,              TILES_TALL - 1, TWH - EH + EX, 1             ],
			[ TILES_WIDE - 1, 0,              1,             TTH - EH - EY ],
			[ TWH + EH + EX,  TILES_TALL - 1, TWH - EH - EX, 1             ],
			[ TILES_WIDE - 1, TTH + EH - EY,  1,             TTH - EH + EY ],
		]
		const wallGeometries = new THREE.Geometry()
		for (const wall of walls) {
			const ww = wall[2] * TILE_SIZE, wh = wall[3] * TILE_SIZE
			const geometry = new THREE.PlaneGeometry(ww, wh)
			geometry.translate(wall[0] * TILE_SIZE - MAP_WIDTH / 2 + ww / 2, wall[1] * TILE_SIZE - MAP_HEIGHT / 2 + wh / 2)
			wallGeometries.merge(geometry)
		}
		const material = new THREE.MeshBasicMaterial({ color: 0xddddcc })
		const mesh = new THREE.Mesh(wallGeometries, material)
		mesh.castShadow = true
		mesh.receiveShadow = true
		this.container.add(mesh)

		const placement = render.rectangle(TILE_SIZE * 2, TILE_SIZE * 2, { color: 0xffffff, parent: ground })
		placement.visible = false

		let cx = null, cy = null
		ground.onHover = () => {}
		ground.onMove = (point) => {
			let tx = point.x
			let ty = point.y
			if (tx <= MIN_X) {
				tx = 2
			} else if (tx >= MAX_X) {
				tx = TILES_WIDE - 2
			} else {
				tx = (Math.round((tx - TILE_SIZE + MAP_WIDTH / 2) / TILE_SIZE) + 1)
			}
			if (ty < MIN_Y) {
				ty = 2
			} else if (ty >= MAX_Y) {
				ty = TILES_TALL - 2
			} else {
				ty = (Math.round((ty - TILE_SIZE + MAP_HEIGHT / 2) / TILE_SIZE) + 1)
			}
			if (tx !== cx || ty !== cy) {
				if (cx !== null) {
					this.toggleTower(cx, cy, false)
				}
				if (this.blockedSquare(tx, ty)) {
					cx = null
					placement.visible = false
					return
				}
				placement.visible = true
				cx = tx
				cy = ty
				placement.position.x = tx * TILE_SIZE - MAP_WIDTH / 2
				placement.position.y = ty * TILE_SIZE - MAP_HEIGHT / 2
				this.toggleTower(cx, cy, true)

				const blocked = !this.updatePaths(true)
				if (blocked !== placement.blocked) {
					placement.blocked = blocked
					placement.material.color.setHex(blocked ? 0xdd8855 : 0x99dd66)
				}
			}
		}

		ground.onBlur = () => {
			placement.visible = false
		}

		ground.onClick = (_point, _rightClick) => {
			if (placement.blocked || !placement.visible) {
				return
			}
			placement.visible = false
			const tower = new Tower(placement.position.x, placement.position.y, this.container)
			this.toggleTower(cx, cy, true, false)
			this.updatePaths(false)
			tower.tx = cx
			tower.ty = cy
			cx = null
			return true
		}
	}

	toggleTower (cx, cy, blocking) {
		let index = cx + (TILES_TALL - cy) * TILES_WIDE
		for (const diff of BLOCK_CHECK) {
			index += diff
			this.blocked[index] = blocking
		}
	}

	blockedSquare (cx, cy) {
		let index = cx + (TILES_TALL - cy) * TILES_WIDE
		for (const diff of BLOCK_CHECK) {
			index += diff
			if (this.blocked[index]) {
				return true
			}
		}
		return false
	}

	entrance (enter, vertical) {
		const result = []
		let tx = vertical ? (TILES_WIDE - ENTRANCE_SIZE) / 2 : (enter ? 1 : TILES_WIDE)
		let ty = vertical ? (enter ? 1 : TILES_TALL) : (TILES_TALL - ENTRANCE_SIZE) / 2
		if (vertical) {
			tx += EX
		} else {
			ty += EY
		}
		for (let eidx = 0; eidx < ENTRANCE_SIZE; eidx += 1) {
			if (vertical) {
				tx += 1
			} else {
				ty += 1
			}
			result[eidx] = (tx - 1) + (ty - 1) * TILES_WIDE
		}
		return result
	}

	spawn () {
		store.state.game.wave += 1
		console.log('Wave', store.state.game.wave)
	}

	//PATHFINDING

	updatePaths (test) {
		if (!test) {
			this.paths = [ tileArray(), tileArray() ]
		}
		return this.pathfind(test, true) && this.pathfind(test, false)
	}

	pathfind (test, vertical) {
		//TODO if test === false then include creep occupied squares
		// console.time('path ' + vertical)
		const path = (test ? this.test : this.paths)[vertical ? 1 : 0]
		const requiredIndecies = new Set(this.entrances[vertical ? 1 : 0])
		let positions = [ ...this.exits[vertical ? 1 : 0] ]
		const searchedIndexes = new Set()
		const blocked = this.blocked
		for (let idx = 0; idx < TOTAL_TILES; idx += 1) {
			if (blocked[idx]) {
				searchedIndexes.add(idx)
			}
		}
		for (const position of positions) {
			searchedIndexes.add(position)
		}

		let firstSearch = true
		let foundPath = false
		while (positions.length) {
			const nextSearch = []
			let diagonal = false
			for (const indexDiffs of this.ordinals) {
				for (const position of positions) {
					const column = position % TILES_WIDE
					const edgeCheck = column === 0 ? -1 : (column === TILES_WIDE - 1 ? 1 : false)
					for (const diffs of indexDiffs) {
						const diffX = diffs[0], diffY = diffs[1]
						if (edgeCheck && diffX === edgeCheck) {
							continue
						}
						const change = diffX + diffY
						const newIndex = position + change
						if (newIndex <= 0 || newIndex >= TOTAL_TILES || searchedIndexes.has(newIndex)) {
							continue
						}
						if (diagonal && (blocked[position + diffX] || blocked[position + diffY])) {
							continue
						}
						if (requiredIndecies.delete(newIndex) && !requiredIndecies.size) {
							foundPath = true
						}
						path[newIndex] = [ Math.sign(-diffX), Math.sign(-diffY) ]
						nextSearch.push(newIndex)
						searchedIndexes.add(newIndex)
					}
				}
				if (firstSearch) {
					break
				}
				diagonal = !diagonal
			}
			if (!nextSearch.length) {
				break
			}
			firstSearch = false
			positions = nextSearch
		}
		// console.timeEnd('path ' + vertical)
		if (!test) { //SAMPLE
			if (!foundPath) {
				console.error('Unable to calculate required path', vertical, requiredIndecies, blocked)
				this.debugPath(path, false)
				return true
			}
			// this.debugPath(path, foundPath && entranceTest) //SAMPLE
		}
		return foundPath
	}

	debugPath (path, entrance) {
		const ARROWS = {
			'10': '→',
			'1-1': '↗',
			'0-1': '↑',
			'-1-1': '↖',
			'-10': '←',
			'-11': '↙',
			'01': '↓',
			'11': '↘',
		}
		let count = 0, out = '%c'
		for (let idx = 0; idx < TOTAL_TILES; idx += 1) {
			const pi = path[idx]
			out += (pi ? ARROWS[`${pi[0]}${pi[1]}`] : '·') + ' '
			if (count >= TILES_WIDE - 1) {
				count = 0
				out += '\n'
			} else {
				count += 1
			}
		}
		console.log(out, `color:${entrance ? 'black' : 'red'};`)
	}

}
