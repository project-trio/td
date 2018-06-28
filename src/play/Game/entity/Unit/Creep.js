import { PlaneBufferGeometry, SphereBufferGeometry, Mesh, MeshBasicMaterial } from 'three'
import render from '@/play/render'

import Unit from '@/play/Game/entity/Unit'

import store from '@/xjs/store'

const PId2 = Math.PI / 2
const MOVE_DIVISOR = 15
const DIAGONAL_DISTANCE = Math.cos(PId2 / 2)
const START_DISTANCE = 64
const MOVEMENT_PADDING = 2

let allCreeps = null
let gameMap

let creepGeometry, creepMaterial

const HP_HEIGHT = 3
const HP_WIDTH = 40
const hpOutlineGeometry = new PlaneBufferGeometry(HP_WIDTH + 1, HP_HEIGHT + 1)
const hpOutlineMaterial = new MeshBasicMaterial({ color: 0x000000 })
const hpBackingGeometry = new PlaneBufferGeometry(HP_WIDTH, HP_HEIGHT)
const hpBackingMaterial = new MeshBasicMaterial({ color: 0xFF3333 })
const hpRemainingGeometry = new PlaneBufferGeometry(HP_WIDTH, HP_HEIGHT)
hpRemainingGeometry.translate(HP_WIDTH / 2, 0, 0)
const hpRemainingMaterial = new MeshBasicMaterial({ color: 0x33FF99 })

export default class Creep extends Unit {

	constructor (data, entranceIndex, vertical, wave) {
		const live = data !== undefined
		super(gameMap.container, live)

		this.unitContainer = render.group(this.container)
		this.container.position.z = 50

		const body = new Mesh(creepGeometry, creepMaterial)
		this.unitContainer.add(body)

		if (live) {
			this.id = `${wave}${data.name}${vertical}`
			this.stats = data
			this.immune = data.immune || false

			this.vertical = vertical
			this.currentIndex = null
			this.setDestination(entranceIndex, data.attackBit === 2)
			const startX = this.destinationX - (vertical ? 0 : START_DISTANCE)
			const startY = this.destinationY + (vertical ? START_DISTANCE : 0)
			this.container.position.x = startX
			this.container.position.y = startY
			this.cX = startX
			this.cY = startY
			this.setMovement(1 - vertical, vertical)
			this.unitContainer.rotation.z = this.destinationAngle

			// Health bar

			this.healthRemaining = this.stats.health
			this.healthScheduled = this.healthRemaining

			this.healthContainer = render.group(this.container)
			this.healthContainer.position.y = 32
			this.healthContainer.position.z = 30

			const outline = new Mesh(hpOutlineGeometry, hpOutlineMaterial)
			const backing = new Mesh(hpBackingGeometry, hpBackingMaterial)
			this.healthBar = new Mesh(hpRemainingGeometry, hpRemainingMaterial)
			this.healthBar.position.x = -HP_WIDTH / 2

			this.healthContainer.add(outline)
			this.healthContainer.add(backing)
			this.healthContainer.add(this.healthBar)
		}

		allCreeps.push(this)
	}

	update (renderTime, timeDelta, tweening) {
		if (!tweening && this.destinationIndex) {
			let atDest = false
			if (this.dX !== 0) {
				atDest = this.dX > 0 ? this.cX > this.destinationX - MOVEMENT_PADDING : this.cX < this.destinationX + MOVEMENT_PADDING
			}
			if (!atDest && this.dY !== 0) {
				atDest = this.dY < 0 ? this.cY > this.destinationY - MOVEMENT_PADDING : this.cY < this.destinationY + MOVEMENT_PADDING
			}
			if (atDest) {
				this.nextTarget()
			}
		}
		const startX = tweening ? this.container.position.x : this.cX
		const startY = tweening ? this.container.position.y : this.cY
		const updateSpeed = this.stats.speed * timeDelta / MOVE_DIVISOR
		const diffX = this.moveX * updateSpeed
		const diffY = this.moveY * updateSpeed
		const positionX = startX + diffX
		const positionY = startY + diffY

		if (!this.currentIndex) {
			const escaped = this.vertical
					? positionY < gameMap.killY
					: positionX > gameMap.killX
			if (escaped) {
				this.die()
				store.state.game.local.lives -= 1
				store.state.game.local.livesChange = store.state.game.local.lives
			}
		}

		this.container.position.x = positionX
		this.container.position.y = positionY
		if (!tweening) {
			this.cX = positionX
			this.cY = positionY
		}
	}

	destroy (renderTime) {
		gameMap.waves.killCreep(renderTime)

		super.destroy()
	}

	die () {
		this.dead = true
		this.healthScheduled = 0
	}

	takeDamage (damage, splash) {
		const newHealth = Math.max(0, this.healthRemaining - damage)
		this.healthRemaining = newHealth

		const healthScale = newHealth / this.stats.health
		if (healthScale > 0) {
			this.healthBar.scale.x = healthScale
			if (splash) {
				this.healthScheduled -= damage
			}
		} else {
			this.die()
			store.state.game.local.gold += this.stats.gold
		}
	}

	// Path

	setDestination (index, flying) {
		if (!flying) {
			this.destinationIndex = index
		}
		const center = gameMap.tileCenter(index)
		this.destinationX = center[0]
		this.destinationY = center[1]
	}

	nextTarget () {
		this.currentIndex = this.destinationIndex
		this.updatePath(false)
		const index = gameMap.moveIndex(this.currentIndex, this.dX, this.dY)
		this.setDestination(index)
	}

	updatePath (newBlocking) {
		if (!this.currentIndex) {
			return
		}
		if (newBlocking && gameMap.tileBlocked(this.destinationIndex)) {
			this.setDestination(this.currentIndex)
			this.setMovement(-this.dX, -this.dY)
		} else {
			const movement = gameMap.tilePath(this.currentIndex, this.vertical)
			if (movement) {
				const [ dX, dY ] = movement
				this.setMovement(dX, dY)
			} else {
				this.currentIndex = null
				this.destinationIndex = null
			}
		}
	}

	setMovement (dX, dY) {
		this.dX = dX
		this.dY = dY
		this.destinationAngle = PId2 * (1 - dX) * (dY || 0)
		const diagonal = dX && dY && DIAGONAL_DISTANCE
		this.moveX = diagonal * dX || dX
		this.moveY = diagonal * -dY || -dY
	}

}

//STATIC

Creep.all = function () {
	return allCreeps
}

Creep.init = (map, tileSize) => {
	allCreeps = []
	gameMap = map

	const creepSize = tileSize / 2 - 1
	creepGeometry = new SphereBufferGeometry(creepSize, creepSize / 2)
	creepMaterial = new MeshBasicMaterial({ color: 0x6688ee })
}

Creep.destroy = () => {
	allCreeps = null
	gameMap = null
}

Creep.update = function (renderTime, timeDelta, tweening) {
	for (let idx = allCreeps.length - 1; idx >= 0; idx -= 1) {
		const creep = allCreeps[idx]
		if (creep.dead) {
			creep.destroy(renderTime)
			allCreeps.splice(idx, 1)
		} else {
			creep.update(renderTime, timeDelta, tweening)
		}
	}
}
