import { Geometry, BoxBufferGeometry, PlaneBufferGeometry, LineSegments, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshLambertMaterial, Vector3 } from 'three'

import store from '@/xjs/store'

import render from '@/play/render'

import towers from '@/play/data/towers'

import Creep from '@/play/entity/Unit/Creep'
import Tower from '@/play/entity/Unit/Tower'

import Paths from '@/play/Game/Map/Paths'

const TILE_SIZE = 28
const TILES_WIDE = 22
const TILES_TALL = 18
const TILES_TOTAL = TILES_WIDE * TILES_TALL
const MAP_WIDTH = TILE_SIZE * TILES_WIDE
const MAP_HEIGHT = TILE_SIZE * TILES_TALL

const MIN_X = -MAP_WIDTH / 2 + TILE_SIZE * 2
const MIN_Y = -MAP_HEIGHT / 2 + TILE_SIZE * 2
const MAX_X = MAP_WIDTH / 2 - TILE_SIZE * 2
const MAX_Y = MAP_HEIGHT / 2 - TILE_SIZE * 2

const ENTRANCE_SIZE = 6
const EX = 1
const EY = 1

export default class GameMap {

	constructor (parent) {
		store.state.game.wave = 0
		this.killY = -(TILES_TALL + 2) * TILE_SIZE / 2
		this.killX = (TILES_WIDE + 2) * TILE_SIZE / 2

		const EH = ENTRANCE_SIZE / 2
		const TWH = TILES_WIDE / 2
		const TTH = TILES_TALL / 2

		this.container = render.group(parent)

		this.paths = new Paths(TILES_WIDE, TILES_TALL, ENTRANCE_SIZE, EX, EY)

		const groundGeometry = new PlaneBufferGeometry(MAP_WIDTH, MAP_HEIGHT)
		const groundMaterial = new MeshLambertMaterial({ color: 0x77aa80 }) //0xccbb99
		const ground = new Mesh(groundGeometry, groundMaterial)
		this.container.add(ground)
		ground.receiveShadow = true
		ground.owner = ground

		const placementGeometry = new PlaneBufferGeometry(TILE_SIZE * 2, TILE_SIZE * 2)
		const placementMaterial = new MeshBasicMaterial({ color: 0xffffff })
		const placement = new Mesh(placementGeometry, placementMaterial)
		ground.add(placement)
		placement.visible = false
		this.placement = placement

		Tower.init(TILE_SIZE, placement)
		Creep.init(this, TILE_SIZE)

		this.setTowerName(store.state.game.build)

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
		const WALL_HEIGHT = 36
		const wallMaterial = new MeshLambertMaterial({ color: 0xddddcc })
		for (const wall of walls) {
			const ww = wall[2] * TILE_SIZE, wh = wall[3] * TILE_SIZE
			const geometry = new BoxBufferGeometry(ww, wh, WALL_HEIGHT)
			const mesh = new Mesh(geometry, wallMaterial)
			mesh.position.set(wall[0] * TILE_SIZE - MAP_WIDTH / 2 + ww / 2, wall[1] * TILE_SIZE - MAP_HEIGHT / 2 + wh / 2, WALL_HEIGHT)
			mesh.castShadow = true
			// mesh.receiveShadow = true
			ground.add(mesh)
		}

		const lineGeometry = new Geometry()
		lineGeometry.vertices.push(new Vector3(-TILE_SIZE, 0, 0))
		lineGeometry.vertices.push(new Vector3(TILE_SIZE, 0, 0))
		lineGeometry.vertices.push(new Vector3(0, -TILE_SIZE + 0, 0))
		lineGeometry.vertices.push(new Vector3(0, TILE_SIZE + 0, 0))
		lineGeometry.translate(EX * TILE_SIZE + 0.5, -EY * TILE_SIZE, 0)
		const lineMaterial = new LineBasicMaterial({ color: 0xeeeeee })
		const lines = new LineSegments(lineGeometry, lineMaterial)
		ground.add(lines)

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
					this.paths.toggleTower(cx, cy, false)
				}
				if (this.paths.blockedSquare(tx, ty)) {
					cx = null
					cy = null
					placement.visible = false
					return
				}
				placement.visible = true
				cx = tx
				cy = ty
				placement.position.x = tx * TILE_SIZE - MAP_WIDTH / 2
				placement.position.y = ty * TILE_SIZE - MAP_HEIGHT / 2
				this.paths.toggleTower(tx, ty, true)

				const blocked = !this.paths.update()
				if (blocked !== placement.blocked) {
					placement.blocked = blocked
					placement.material.color.setHex(blocked ? 0xdd8855 : 0x99dd88)
				}
			}
		}

		ground.onBlur = () => {
			if (cx !== null) {
				this.paths.toggleTower(cx, cy, false)
				cx = null
			}
			placement.visible = false
		}

		ground.onClick = (point, button) => {
			if (button === 2) {
				return
			}
			if (placement.blocked || !placement.visible || !this.paths.update(Creep.all())) {
				return
			}
			const towerName = store.state.game.build
			const towerData = towers[towerName]
			const cost = towerData.cost[0]
			if (cost > store.state.game.local.gold) {
				return
			}
			store.state.game.local.gold -= cost
			placement.visible = false
			new Tower(towerName, towerData, this.container, cx, cy, placement.position.x, placement.position.y)
			this.paths.toggleTower(cx, cy, true)
			this.paths.apply()
			for (const unit of Creep.all()) {
				unit.updatePath(true)
			}
			cx = null
			return true
		}
	}

	setTowerName (name) {
		if (this.placement.current) {
			this.placement.current.visible = false
		}
		const tower = this.placement.towers[name]
		tower.visible = true
		tower.rotation.z = Math.random() * Math.PI * 2
		this.placement.current = tower
	}

	removeTower (tower) {
		this.paths.toggleTower(tower.tX, tower.tY, false)
		this.paths.update()
		this.paths.apply()
	}

	tileCenter (index) {
		const tx = (index % TILES_WIDE) - TILES_WIDE / 2 + 0.5
		const ty = TILES_TALL - Math.floor(index / TILES_WIDE) - TILES_TALL / 2 - 0.5
		return [ tx * TILE_SIZE, ty * TILE_SIZE ]
	}

	tilePath (index, vertical) {
		return this.paths.moves[vertical][index]
	}

	tileBlocked (index) {
		return !this.paths.moves[0][index]
	}

	moveIndex (index, dx, dy) {
		return index + dx + dy * TILES_WIDE
	}
	safeMoveIndex (index, dx, dy) {
		let result = index + dx
		if (dx !== 0 && Math.floor(index / TILES_WIDE) !== Math.floor(result / TILES_WIDE)) {
			return null
		}
		result += dy * TILES_WIDE
		if (result <= 0 || result >= TILES_TOTAL) {
			return null
		}
		return this.tileBlocked(result) ? null : result
	}

}
