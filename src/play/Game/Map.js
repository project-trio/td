import * as THREE from 'three'

import render from '@/play/render'

const TILE_SIZE = 32
const TILES_WIDE = 20
const TILES_TALL = 16
const MAP_WIDTH = TILE_SIZE * TILES_WIDE
const MAP_HEIGHT = TILE_SIZE * TILES_TALL

const MIN_X = -MAP_WIDTH / 2 + TILE_SIZE * 2
const MIN_Y = -MAP_HEIGHT / 2 + TILE_SIZE * 2
const MAX_X = MAP_WIDTH / 2 - TILE_SIZE * 2
const MAX_Y = MAP_HEIGHT / 2 - TILE_SIZE * 2

const ENTRANCE_SIZE = 4
const EX = 0
const EY = 1

export default class GameMap {

	constructor (parent) {
		this.container = render.group(parent)
		this.container.interactive = true

		const ground = render.rectangle(MAP_WIDTH, MAP_HEIGHT, { color: 0x448866, parent: this.container })
		ground.owner = ground

		const EH = ENTRANCE_SIZE / 2
		const TWH = TILES_WIDE / 2
		const TTH = TILES_TALL / 2
		const walls = [
			[ 0,              0,              1,             TTH - EH - EY ],
			[ 0,              0,              TWH - EH + EX, 1             ],
			[ 0,              10 - EY,        1,             TTH - EH + EY ],
			[ TWH + EH + EX,  0,              TWH - EH - EX, 1             ],
			[ 0,              TILES_TALL - 1, TWH - EH + EX, 1             ],
			[ TILES_WIDE - 1, 0,              1,             TTH - EH - EY ],
			[ TWH + EH + EX,  TILES_TALL - 1, TWH - EH - EX, 1             ],
			[ TILES_WIDE - 1, 10 - EY,        1,             TTH - EH + EY ],
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
	}

}
