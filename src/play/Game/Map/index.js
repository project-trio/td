import { Group, Geometry, BoxBufferGeometry, PlaneBufferGeometry, LineSegments, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, Vector3 } from 'three'

import store from '@/app/store'

import render from '@/play/render'
import animate from '@/play/render/animate'

import towers from '@/play/data/towers'

import Bullet from '@/play/entity/Bullet'
import Creep from '@/play/entity/Unit/Creep'
import Tower from '@/play/entity/Unit/Tower'

import Vox from '@/play/external/vox'

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
const NUMBER_SIZE = 3

const numberModelGeometry = []
const coinMaterial = new MeshPhongMaterial({ color: 0x997700, shininess: 50 })
const heartMaterial = new MeshPhongMaterial({ color: 0xaa2222, shininess: 50 })
let coinBuilder, heartBuilder
{
	const voxParser = new Vox.Parser()
	for (let digit = 0; digit < 10; digit += 1) {
		store.state.loading += 1
		voxParser.parse(require(`@/play/assets/text/${digit}.vox`)).then((voxelData) => {
			store.state.loading -= 1
			numberModelGeometry[digit] = new Vox.MeshBuilder(voxelData, { voxelSize: NUMBER_SIZE, material: coinMaterial }).geometry
		})
	}
	store.state.loading += 1
	voxParser.parse(require('@/play/assets/text/coin.vox')).then((voxelData) => {
		store.state.loading -= 1
		coinBuilder = new Vox.MeshBuilder(voxelData, { voxelSize: NUMBER_SIZE, material: coinMaterial })
	})
	store.state.loading += 1
	voxParser.parse(require('@/play/assets/text/heart.vox')).then((voxelData) => {
		store.state.loading -= 1
		heartBuilder = new Vox.MeshBuilder(voxelData, { voxelSize: NUMBER_SIZE, material: heartMaterial })
	})
}

export default class GameMap {

	constructor () {
		store.state.game.wave = 0
		this.killY = -(TILES_TALL + 2) * TILE_SIZE / 2
		this.killX = (TILES_WIDE + 2) * TILE_SIZE / 2

		const EH = ENTRANCE_SIZE / 2
		const TWH = TILES_WIDE / 2
		const TTH = TILES_TALL / 2

		this.container = new Group()
		this.goldContainer = render.group(this.container)
		const offsetY = MAP_HEIGHT / 2 + NUMBER_SIZE * 4
		const offsetZ = 64
		this.goldContainer.position.set(-MAP_WIDTH / 2 + 14, offsetY, offsetZ)
		this.goldContainer.add(coinBuilder.createMesh())
		this.livesContainer = render.group(this.container)
		this.livesContainer.position.set(MAP_WIDTH / 2 - 18 - NUMBER_SIZE * 12, offsetY, offsetZ)
		this.livesContainer.add(heartBuilder.createMesh())

		this.applyGold()
		this.applyLives()

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
		Bullet.init(TILE_SIZE)

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
		const wallMaterial = new MeshLambertMaterial({ color: 0xddddcc }) //SAMPLE 0xbbbbaa
		for (const wall of walls) {
			const ww = wall[2] * TILE_SIZE, wh = wall[3] * TILE_SIZE
			const geometry = new BoxBufferGeometry(ww, wh, WALL_HEIGHT)
			const mesh = new Mesh(geometry, wallMaterial)
			mesh.position.set(wall[0] * TILE_SIZE - MAP_WIDTH / 2 + ww / 2, wall[1] * TILE_SIZE - MAP_HEIGHT / 2 + wh / 2, WALL_HEIGHT)
			mesh.castShadow = true
			// mesh.receiveShadow = true
			ground.add(mesh)
		}

		const lineMaterial = new LineBasicMaterial({ color: 0xeeeeee })
		const crossGeometry = new Geometry()
		crossGeometry.vertices.push(new Vector3(-TILE_SIZE * 2, 0, 0))
		crossGeometry.vertices.push(new Vector3(TILE_SIZE * 2, 0, 0))
		crossGeometry.vertices.push(new Vector3(0, -TILE_SIZE + 0, 0))
		crossGeometry.vertices.push(new Vector3(0, TILE_SIZE + 0, 0))
		crossGeometry.translate(EX * TILE_SIZE + 0.5, -EY * TILE_SIZE, 0)

		const pathsGeometry = new Geometry()
		for (const [ mX, mY ] of [ [1, 1], [1, -1], [-1, 1], [-1, -1] ]) {
			const enterX = mX * ENTRANCE_SIZE / 2 + EX
			const enterY = mY * ENTRANCE_SIZE / 2 - EY
			const offX = mX < 0 ? 0.5 : 0
			const offY = mY < 0 ? -0.5 : 0
			pathsGeometry.vertices.push(new Vector3(enterX * TILE_SIZE + offX, enterY * TILE_SIZE + offY, 0))
			pathsGeometry.vertices.push(new Vector3((enterX + mX * 2) * TILE_SIZE + offX, enterY * TILE_SIZE + offY, 0))

			pathsGeometry.vertices.push(new Vector3(enterX * TILE_SIZE + offX, enterY * TILE_SIZE + offY, 0))
			pathsGeometry.vertices.push(new Vector3(enterX * TILE_SIZE + offX, (enterY + mY * 1) * TILE_SIZE + offY, 0))
		}

		const crossLines = new LineSegments(crossGeometry, lineMaterial.clone())
		const pathLines = new LineSegments(pathsGeometry, lineMaterial.clone())
		ground.add(crossLines)
		ground.add(pathLines)

		animate.add(pathLines, 'opacity', {
			start: -2000,
			duration: 2000,
			to: 0,
			pow: 0.5,
			removes: true,
			onComplete () {
				ground.remove(pathLines)
			},
		})
		animate.add(crossLines, 'opacity', {
			start: -2000,
			duration: 2000,
			from: 0,
			to: 1,
		})

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
			if (button !== 0) {
				return
			}
			const gameState = store.state.game
			if (gameState.overlay) {
				gameState.overlay = null
				return
			}
			if (placement.blocked || !placement.visible || !this.paths.update(Creep.all())) {
				return
			}
			const towerName = gameState.build || 'pellet'
			const towerData = towers[towerName]
			const cost = towerData.cost[0]
			if (cost > gameState.local.gold) {
				return
			}
			store.changeGold(-cost)
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

	applyGold () {
		if (this.goldDigitsContainer) {
			render.remove(this.goldDigitsContainer)
		}
		const amount = Math.floor(store.state.game.local.gold)
		this.goldDigitsContainer = this.makeText(amount, coinMaterial, this.goldContainer)
	}

	applyLives () {
		if (this.livesDigitsContainer) {
			render.remove(this.livesDigitsContainer)
		}
		this.livesDigitsContainer = this.makeText(store.state.game.local.lives, heartMaterial, this.livesContainer)
	}

	makeText (amount, material, parent) {
		const digits = amount.toString().split('')
		let offset = 4
		const container = render.group(parent)
		for (const digit of digits) {
			offset += NUMBER_SIZE * 6 + 1
			const numberMesh = new Mesh(numberModelGeometry[digit], material)
			numberMesh.position.x = offset
			container.add(numberMesh)
		}
		return container
	}

	setTowerName (name) {
		if (this.placement.current) {
			this.placement.current.visible = false
		}
		const tower = this.placement.towers[name]
		if (tower) {
			tower.visible = true
			if (tower.targets) {
				tower.rotation.z = Math.random() * Math.PI * 2
			}
			this.placement.current = tower
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
