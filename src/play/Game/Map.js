import * as THREE from 'three'

import render from '@/play/render'

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

const ENTRANCE_SIZE = 6
const EX = 0
const EY = 1

const tileArray = () => {
	return new Array(TOTAL_TILES)
}

export default class GameMap {

	constructor (parent) {
		const EH = ENTRANCE_SIZE / 2
		const TWH = TILES_WIDE / 2
		const TTH = TILES_TALL / 2

		this.container = render.group(parent)
		this.container.interactive = true

		this.blocked = tileArray()
		this.paths = [ tileArray(), tileArray() ]
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

		this.path(false, true)
		this.path(false, false)

		const ground = render.rectangle(MAP_WIDTH, MAP_HEIGHT, { color: 0x448866, parent: this.container })
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
		const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
		const mesh = new THREE.Mesh(wallGeometries, material)
		mesh.castShadow = true
		mesh.receiveShadow = true
		this.container.add(mesh)

		ground.placement = render.rectangle(TILE_SIZE * 2, TILE_SIZE * 2, { color: 0xffffff, parent: ground })
		ground.placement.visible = false

		ground.onHover = () => {
			ground.placement.visible = true
		}

		ground.onMove = (point) => {
			let tx = point.x
			let ty = point.y
			if (tx <= MIN_X) {
				tx = MIN_X
			} else if (tx >= MAX_X) {
				tx = MAX_X
			} else {
				tx = (Math.round((tx - TILE_SIZE) / TILE_SIZE) + 1) * TILE_SIZE
			}
			if (ty < MIN_Y) {
				ty = MIN_Y
			} else if (ty >= MAX_Y) {
				ty = MAX_Y
			} else {
				ty = (Math.round((point.y - TILE_SIZE) / TILE_SIZE) + 1) * TILE_SIZE
			}
			ground.placement.position.x = tx
			ground.placement.position.y = ty
		}

		ground.onBlur = () => {
			ground.placement.visible = false
		}

		ground.onClick = (_point, _rightClick) => {
			return true
		}

		//// SAMPLE output
		// const ARROWS = {
		// 	'10': '→',
		// 	'1-1': '↗',
		// 	'0-1': '↑',
		// 	'-1-1': '↖',
		// 	'-10': '←',
		// 	'-11': '↙',
		// 	'01': '↓',
		// 	'11': '↘',
		// }
		// let count = 0, out = ''
		// const path = this.path(true, true)
		// for (let idx = 0; idx < TOTAL_TILES; idx += 1) {
		// 	const pi = path[idx]
		// 	out += (pi ? ARROWS[`${pi[0]}${pi[1]}`] : '·') + ' '
		// 	if (count >= TILES_WIDE - 1) {
		// 		count = 0
		// 		out += '\n'
		// 	} else {
		// 		count += 1
		// 	}
		// }
		// console.log(out)
	}

	entrance (enter, vertical) {
		const result = []
		let tx = vertical ? (TILES_WIDE - ENTRANCE_SIZE) / 2 : (enter ? 1 : TILES_WIDE)
		let ty = vertical ? (enter ? 1 : TILES_TALL) : (TILES_TALL - ENTRANCE_SIZE) / 2 + 1
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

	path (test, vertical) {
		// console.time('path ' + vertical)
		const path = this[test ? 'test' : 'paths'][vertical ? 1 : 0]
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
		while (positions.length) {
			const nextSearch = []
			let diagonal = false
			for (const indexDiffs of this.ordinals) {
				for (const position of positions) {
					const column = position % TILES_WIDE
					const edgeCheck = column === 0
							? -1
							: column === TILES_WIDE - 1
								? 1
								: false
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
		return path
	}

}
