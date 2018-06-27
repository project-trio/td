import * as THREE from 'three'

import store from '@/xjs/store'

import render from '@/play/render'

import Creep from '@/play/Game/entity/Creep'
import Unit from '@/play/Game/entity/Unit'
import Tower from '@/play/Game/entity/Tower'

import Paths from '@/play/Game/Map/Paths'
import Waves from '@/play/Game/Map/Waves'

const TILE_SIZE = 32
const TILES_WIDE = 22
const TILES_TALL = 18
const MAP_WIDTH = TILE_SIZE * TILES_WIDE
const MAP_HEIGHT = TILE_SIZE * TILES_TALL

const MIN_X = -MAP_WIDTH / 2 + TILE_SIZE * 2
const MIN_Y = -MAP_HEIGHT / 2 + TILE_SIZE * 2
const MAX_X = MAP_WIDTH / 2 - TILE_SIZE * 2
const MAX_Y = MAP_HEIGHT / 2 - TILE_SIZE * 2

const ENTRANCE_SIZE = 6
const EX = 0
const EY = 1

export default class GameMap {

	constructor (parent) {
		store.state.game.wave = 0

		const EH = ENTRANCE_SIZE / 2
		const TWH = TILES_WIDE / 2
		const TTH = TILES_TALL / 2

		this.container = render.group(parent)
		this.container.interactive = true

		this.paths = new Paths(TILES_WIDE, TILES_TALL, ENTRANCE_SIZE, EX, EY)
		this.waves = new Waves(this.paths.entrances)

		Tower.init(TILE_SIZE)
		Creep.init(this, TILE_SIZE)

		const ground = render.rectangle(MAP_WIDTH, MAP_HEIGHT, { color: 0x88bb99, parent: this.container }) //0xccbb99
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
					placement.material.color.setHex(blocked ? 0xdd8855 : 0x99dd66)
				}
			}
		}

		ground.onBlur = () => {
			placement.visible = false
		}

		ground.onClick = (point, rightClick) => {
			if (rightClick) {
				return
			}
			if (placement.blocked || !placement.visible || !this.paths.update(Unit.all())) {
				return
			}
			placement.visible = false
			const tower = new Tower(placement.position.x, placement.position.y, this.container, true)
			this.paths.toggleTower(cx, cy, true)
			this.paths.apply()
			tower.tX = cx
			tower.tY = cy
			for (const unit of Unit.all()) {
				if (unit.updatePath) {
					unit.updatePath(true)
				}
			}
			cx = null
			return true
		}
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
		return this.paths.move[vertical][index]
	}

	tileBlocked (index) {
		return this.paths.blocked[index]
	}

	moveIndex (index, dx, dy) {
		return index + dx + dy * TILES_WIDE
	}

	spawn (renderTime) {
		store.state.game.wave += 1
		this.waves.spawn(renderTime, store.state.game.wave)
	}

}
