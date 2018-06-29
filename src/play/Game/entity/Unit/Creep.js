import { PlaneBufferGeometry, Mesh, MeshBasicMaterial } from 'three'
import render from '@/play/render'
import animate from '@/play/render/animate'

import creeps from '@/play/data/creeps'

import Vox from '@/play/external/vox'

import gameMath from '@/play/Game/math'
import Unit from '@/play/Game/entity/Unit'

import store from '@/xjs/store'

const PId2 = Math.PI / 2
const DIAGONAL_DISTANCE = Math.cos(PId2 / 2)
const START_DISTANCE = 96
const MOVEMENT_PADDING = 2

let allCreeps = []
let gameMap

const HP_HEIGHT = 5
const HP_WIDTH = 36
// const hpOutlineGeometry = new PlaneBufferGeometry(HP_WIDTH + 1, HP_HEIGHT + 1)
// const hpOutlineMaterial = new MeshBasicMaterial({ color: 0x000000 })
const hpBackingGeometry = new PlaneBufferGeometry(HP_WIDTH, HP_HEIGHT)
const hpBackingMaterial = new MeshBasicMaterial({ color: 0xee3333 })
const hpRemainingGeometry = new PlaneBufferGeometry(HP_WIDTH, HP_HEIGHT)
hpRemainingGeometry.translate(HP_WIDTH / 2, 0, 0)
const hpRemainingMaterial = new MeshBasicMaterial({ color: 0x88ee77 })

const creepModelBuilders = {}
{
	const voxParser = new Vox.Parser()
	for (const creep of creeps) {
		const modelName = creep.model
		if (creepModelBuilders[modelName] !== undefined) {
			continue
		}
		store.state.loading += 1
		creepModelBuilders[modelName] = null
		voxParser.parse(require(`@/assets/creeps/${modelName}.vox`)).then((voxelData) => {
			store.state.loading -= 1
			creepModelBuilders[modelName] = new Vox.MeshBuilder(voxelData, { voxelSize: 2 })
		})
	}
}

export default class Creep extends Unit {

	constructor (renderTime, data, entranceIndex, vertical, wave) {
		const live = data !== undefined
		super(gameMap.container, live)

		this.unitContainer = render.group(this.container)

		const body = creepModelBuilders[data.model].createMesh()
		body.material = body.material.clone()
		body.material.color.setHex(data.color)
		body.rotation.x = Math.PI / 2
		body.castShadow = true
		this.body = body
		this.unitContainer.add(body)

		this.targetable = false

		if (live) {
			animate.add(this.unitContainer.position, 'z', {
				start: renderTime,
				from: -256,
				duration: 500,
				pow: 2,
			})
			animate.add(body.rotation, 'z', {
				start: renderTime,
				from: Math.PI,
				duration: 500,
			})
			animate.add(body, 'opacity', {
				start: renderTime,
				from: 0.1,
				to: 1,
				duration: 250,
				onComplete: () => {
					this.targetable = true
				},
			})

			const name = data.name
			this.id = `${wave}${name}${vertical}`
			this.stats = data
			this.immune = name === 'immune'
			this.setSlow(0, 0)

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
			this.destinationAngle = null

			// Health bar

			this.healthRemaining = this.stats.health
			this.healthScheduled = this.healthRemaining

			this.healthContainer = render.group(this.container)
			this.healthContainer.position.y = 24
			this.healthContainer.position.z = 24

			// const outline = new Mesh(hpOutlineGeometry, hpOutlineMaterial)
			const backing = new Mesh(hpBackingGeometry, hpBackingMaterial)
			this.healthBar = new Mesh(hpRemainingGeometry, hpRemainingMaterial)
			this.healthBar.position.x = -HP_WIDTH / 2

			// this.healthContainer.add(outline)
			this.healthContainer.add(backing)
			this.healthContainer.add(this.healthBar)
		}

		allCreeps.push(this)
	}

	setSlow (slowPercent, until) {
		if (!slowPercent || slowPercent > this.slow) {
			this.moveSpeedCheck = this.stats.speed * (1 - slowPercent / 100) / 12.5
			this.slow = slowPercent
		}
		this.slowUntil = until
	}

	update (renderTime, timeDelta, tweening) {
		if (!tweening) {
			if (this.slowUntil && this.slowUntil <= renderTime) {
				this.setSlow(0, 0)
			}
			if (this.destinationIndex) {
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
		}
		const startX = tweening ? this.container.position.x : this.cX
		const startY = tweening ? this.container.position.y : this.cY
		const updateSpeed = this.moveSpeedCheck * timeDelta
		const diffX = this.moveX * updateSpeed
		const diffY = this.moveY * updateSpeed
		const positionX = startX + diffX
		const positionY = startY + diffY

		if (!this.currentIndex) {
			const escaped = this.vertical
					? positionY < gameMap.killY
					: positionX > gameMap.killX
			if (escaped) {
				this.die(renderTime, false)
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

		const destinationAngle = this.destinationAngle
		if (destinationAngle !== null) {
			const currentAngle = this.unitContainer.rotation.z
			const angleDiff = gameMath.radianDistance(currentAngle, destinationAngle)
			const turnDistance = timeDelta / 200
			let newAngle
			if (Math.abs(angleDiff) < turnDistance) {
				newAngle = destinationAngle
			} else {
				let spinDirection = angleDiff < 0 ? -1 : 1
				newAngle = currentAngle + (turnDistance * spinDirection)
			}
			this.unitContainer.rotation.z = newAngle
		}
	}

	destroy (renderTime) {
		gameMap.waves.killCreep(renderTime)

		super.destroy()
	}

	die (renderTime, killed) {
		const deathDuration = killed ? 200 : 600
		this.dead = renderTime + deathDuration
		this.healthScheduled = 0
		if (killed) {
			animate.add(this.unitContainer.scale, 'z', {
				start: renderTime,
				to: 0.01,
				duration: deathDuration,
			})
			animate.add(this.body, 'opacity', {
				start: renderTime,
				to: 0,
				duration: deathDuration,
			})
			this.body.castShadow = false
		} else {
			animate.add(this.unitContainer.position, 'z', {
				start: renderTime,
				to: -256,
				duration: deathDuration,
				pow: 2,
			})
			animate.add(this.body.rotation, 'x', {
				start: renderTime,
				to: (Math.random() - 0.5) * Math.PI * 4,
				duration: 500,
			})
			animate.add(this.body.rotation, 'y', {
				start: renderTime,
				to: (Math.random() - 0.5) * Math.PI,
				duration: 500,
			})
		}
	}

	takeDamage (renderTime, damage, splash) {
		const newHealth = Math.max(0, this.healthRemaining - damage)
		this.healthRemaining = newHealth

		const healthScale = newHealth / this.stats.health
		if (healthScale > 0) {
			this.healthBar.scale.x = healthScale
			if (splash) {
				this.healthScheduled -= damage
			}
		} else {
			this.healthBar.scale.x = 0
			this.die(renderTime, true)
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
		this.destinationAngle = Math.atan2(-dY, dX)
		const diagonal = dX && dY && DIAGONAL_DISTANCE
		this.moveX = diagonal * dX || dX
		this.moveY = diagonal * -dY || -dY
	}

}

//STATIC

Creep.all = () => {
	return allCreeps
}

Creep.init = (map, _tileSize) => {
	gameMap = map
}

Creep.destroy = () => {
	allCreeps = []
	gameMap = null
}

Creep.update = (renderTime, timeDelta, tweening) => {
	for (let idx = allCreeps.length - 1; idx >= 0; idx -= 1) {
		const creep = allCreeps[idx]
		if (creep.dead) {
			if (!tweening && renderTime > creep.dead) {
				creep.destroy(renderTime)
				allCreeps.splice(idx, 1)
			}
		} else {
			creep.update(renderTime, timeDelta, tweening)
		}
	}
}
