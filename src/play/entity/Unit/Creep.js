import { PlaneBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import random from '@/xjs/random'
import store from '@/xjs/store'

import distance from '@/play/distance'
import render from '@/play/render'
import animate from '@/play/render/animate'

import creeps from '@/play/data/creeps'
import creepAnimations from '@/play/data/creep_animations'

import Unit from '@/play/entity/Unit'

import Vox from '@/play/external/vox'

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
hpBackingMaterial.depthTest = false
const hpRemainingGeometry = new PlaneBufferGeometry(HP_WIDTH, HP_HEIGHT)
hpRemainingGeometry.translate(HP_WIDTH / 2, 0, 0)
const hpRemainingMaterial = new MeshBasicMaterial({ color: 0x88ee77 })
hpRemainingMaterial.depthTest = false

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

const SPLIT_ARRAY = []
const MAX_SPAWN_DISTANCE = 2
for (let x = 0; x <= MAX_SPAWN_DISTANCE; x += 1) {
	for (let y = x === 0 ? 1 : 0; y <= MAX_SPAWN_DISTANCE; y += 1) {
		SPLIT_ARRAY.push([ x, y ])
		if (x !== 0) {
			SPLIT_ARRAY.push([ -x, y ])
		}
		if (y !== 0) {
			SPLIT_ARRAY.push([ x, -y ])
		}
		if (x !== 0 && y !== 0) {
			SPLIT_ARRAY.push([ -x, -y ])
		}
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

		if (live) {
			const spawnDuration = 250
			this.spawningAt = renderTime + spawnDuration
			this.deadAt = 0
			this.killed = false

			const name = data.name
			const flying = data.attackBit === 2
			if (flying) {
				this.unitContainer.position.z = 64
			}

			this.wave = wave
			this.id = `${wave}${name}${vertical}`
			this.stats = data
			this.immune = name === 'immune'
			this.setSlow(0, 0)

			this.vertical = vertical
			this.currentIndex = null
			if (entranceIndex !== null) {
				this.setDestination(entranceIndex, flying)
				const startX = this.destinationX - (vertical ? 0 : START_DISTANCE)
				const startY = this.destinationY + (vertical ? START_DISTANCE : 0)
				this.container.position.x = startX
				this.container.position.y = startY
				this.cX = startX
				this.cY = startY

				this.applyAnimations(renderTime, 'spawn', spawnDuration)
			}
			this.setMovement(1 - vertical, vertical)
			this.unitContainer.rotation.z = this.destinationAngle
			this.destinationAngle = null

			// Health bar

			this.healthRemaining = this.stats.health
			this.healthScheduled = this.healthRemaining

			this.healthContainer = render.group(this.container)
			this.healthContainer.position.y = 24
			this.healthContainer.position.z = 24
			this.healthContainer.visible = false

			// const outline = new Mesh(hpOutlineGeometry, hpOutlineMaterial)
			this.healthBacking = new Mesh(hpBackingGeometry, hpBackingMaterial.clone())
			this.healthBar = new Mesh(hpRemainingGeometry, hpRemainingMaterial)
			this.healthBar.position.x = -HP_WIDTH / 2

			// outline.renderOrder = 9000
			this.healthBacking.renderOrder = 9001
			this.healthBar.renderOrder = 9002

			// this.healthContainer.add(outline)
			this.healthContainer.add(this.healthBacking)
			this.healthContainer.add(this.healthBar)

			allCreeps.push(this)
		}
	}

	applyAnimations (renderTime, type, duration) {
		for (const animation of creepAnimations[this.stats.name][type]) {
			let target = this
			for (const key of animation.traverse) {
				target = target[key]
			}
			const data = Object.assign({}, animation.data)
			if (animation.to) {
				data.to = animation.to()
			} else if (animation.from) {
				data.from = animation.from()
			}
			data.start = renderTime
			data.duration = duration * (animation.durationMultiplier || 1)
			animate.add(target, animation.property, data)
		}
	}

	// Update

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
			const angleDiff = distance.betweenRadians(currentAngle, destinationAngle)
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

	// Damage

	destroy (renderTime) {
		const childrenKilled = this.killed ? 0 : this.stats.children
		gameMap.waves.killCreep(renderTime, childrenKilled)

		super.destroy()
	}

	die (renderTime, killed) {
		const deathDuration = killed ? 250 : 600
		this.deadAt = renderTime + deathDuration
		this.spawningAt = renderTime + deathDuration * 2
		this.healthScheduled = 0
		this.killed = killed
		if (killed) {
			if (this.stats.children) {
				if (this.currentIndex === null) {
					this.killed = false
				} else {
					this.split(renderTime)
				}
			}
			this.body.castShadow = false
		}
		this.applyAnimations(renderTime, killed ? 'kill' : 'leak', deathDuration)
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
			this.healthBar.visible = false
			this.die(renderTime, true)
			store.state.game.local.gold += this.stats.gold
		}
	}

	// Path

	setDestination (index, flying) {
		if (!flying) {
			this.destinationIndex = index
		}
		[ this.destinationX, this.destinationY ] = gameMap.tileCenter(index)
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

	// Creep-specific

	split (renderTime) {
		const data = {
			health: this.stats.health / 2,
			color: this.stats.color,
			attackBit: this.stats.attackBit,
			speed: this.stats.speed,
			gold: 0,
		}
		if (this.stats.boss) {
			data.name = 'spawn'
			data.model = 'split'
			data.children = 2
		} else {
			data.name = 'spawnlet'
			data.model = 'base'
			data.scale = 0.67
			data.children = 0
		}

		for (let split = 0; split < 2; split += 1) {
			let spawnIndex = this.currentIndex
			for (const [ dX, dY ] of random.shuffle(SPLIT_ARRAY)) { //TODO shuffle once
				const checkIndex = gameMap.safeMoveIndex(this.currentIndex, dX, dY)
				if (checkIndex) {
					spawnIndex = checkIndex
					break
				}
			}
			const creep = new Creep(renderTime, data, null, this.vertical, this.wave)
			const [ splitX, splitY ] = gameMap.tileCenter(spawnIndex)
			creep.cX = splitX
			creep.cY = splitY
			creep.destinationIndex = spawnIndex
			creep.nextTarget()

			const sourceX = this.cX, sourceY = this.cY
			const position = creep.container.position
			position.x = sourceX
			position.y = sourceY
			const splitDuration = 200
			creep.spawningAt = renderTime + splitDuration
			animate.add(position, 'x', {
				start: renderTime,
				from: sourceX,
				to: splitX,
				duration: splitDuration,
				pow: 2,
			})
			animate.add(position, 'y', {
				start: renderTime,
				from: sourceY,
				to: splitY,
				duration: splitDuration,
				pow: 2,
			})
		}
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
		if (creep.deadAt) {
			if (!tweening && renderTime > creep.deadAt) {
				creep.destroy(renderTime)
				allCreeps.splice(idx, 1)
			}
		} else {
			let spawning = creep.spawningAt
			if (spawning) {
				if (!tweening && renderTime >= spawning) {
					creep.spawningAt = null
					creep.healthContainer.visible = true
				} else {
					continue
				}
			}
			creep.update(renderTime, timeDelta, tweening)
		}
	}
}
