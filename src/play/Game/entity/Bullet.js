import { SphereBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import local from '@/xjs/local'
import store from '@/xjs/store'

import render from '@/play/render'

import towers from '@/play/data/towers'

import gameMath from '@/play/Game/math'

import Splash from '@/play/Game/entity/Splash'
import Creep from '@/play/Game/entity/Unit/Creep'

//LOCAL

const COLLISION_DISTANCE = 300

let allBullets = []

const bulletsCache = {}
for (const name in towers) {
	if (name === 'names') {
		continue
	}
	const towerData = towers[name]
	const geometry = new SphereBufferGeometry(towerData.bulletSize || 4)
	const material = new MeshBasicMaterial({ color: towerData.color })
	bulletsCache[name] = [ geometry, material ]
}

class Bullet {

	// Constructor

	constructor (source, target, data, parent, initialDistance) {
		const startAngle = null //TODO source.top.rotation.z
		this.unitTarget = target.stats !== undefined
		this.name = source.name

		this.explosionRadius = data.explosionRadius
		this.slow = data.slow

		this.container = render.group(parent)
		const cached = bulletsCache[source.name]
		const ball = new Mesh(cached[0], cached[1])
		this.container.add(ball)

		this.attackDamage = data.attackDamage
		target.healthScheduled -= data.attackDamage
		this.moveConstant = data.bulletSpeed / local.game.tickDuration
		if (data.bulletAcceleration) {
			this.moveAcceleration = 0.00000005
			this.startTime = store.state.game.renderTime
		}

		this.cX = source.cX
		this.cY = source.cY
		this.container.position.set(this.cX, this.cY, source.height || 10)
		if (startAngle) {
			this.container.rotation.z = startAngle
		}
		this.target = target
		this.updateTarget(true)
		if (initialDistance) {
			this.cX += Math.floor(Math.cos(this.moveAngle) * initialDistance)
			this.cY += Math.floor(Math.sin(this.moveAngle) * initialDistance)
			this.updatePosition()
		}

		allBullets.push(this)
	}

	// Move

	setDestination (x, y) {
		const dx = x - this.cX
		const dy = y - this.cY
		let moveX, moveY
		const moveAngle = Math.atan2(dy, dx)
		this.moveAngle = moveAngle
		moveX = Math.cos(moveAngle)
		moveY = Math.sin(moveAngle)
		this.container.rotation.z = moveAngle
		this.moveX = moveX
		this.moveY = moveY
		this.destX = x
		this.destY = y
	}

	updatePosition (moveToX, moveToY) {
		if (!moveToX) {
			moveToX = this.cX
			moveToY = this.cY
		}
		this.container.position.x = moveToX
		this.container.position.y = moveToY
	}

	reachedDestination (renderTime) {
		const damage = this.attackDamage
		const targetable = this.target.targetable
		if (this.explosionRadius) {
			new Splash(renderTime, this, this.target, this.explosionRadius, this.container.parent)
			const radiusCheck = gameMath.checkRadius(this.explosionRadius)
			const slow = this.slow
			const slowUntil = renderTime + 1000
			const { cX, cY } = this
			for (const creep of Creep.all()) {
				if (slow && creep.immune) {
					continue
				}
				if (creep.targetable && creep.distanceTo(cX, cY) <= radiusCheck) {
					creep.takeDamage(renderTime, damage, creep !== this.target)
					if (slow && !creep.deadAt) {
						creep.setSlow(slow, slowUntil)
					}
				}
			}
		} else if (targetable) {
			this.target.takeDamage(renderTime, damage, false)
		}

		this.remove = true
	}

	move (renderTime, timeDelta, tweening) {
		let fromX, fromY
		let moveByX, moveByY
		if (tweening) {
			fromX = this.container.position.x
			fromY = this.container.position.y

			const tweenScalar = this.currentSpeed * timeDelta
			moveByX = tweenScalar * this.moveX
			moveByY = tweenScalar * this.moveY
		} else {
			fromX = this.cX
			fromY = this.cY

			// Cache
			let speed = this.moveConstant
			if (this.moveAcceleration) {
				const timeElapsed = Math.min(3000, renderTime - this.startTime)
				speed += this.moveAcceleration * timeElapsed * timeElapsed
			}
			this.currentSpeed = speed
			const moveScalar = speed * timeDelta
			moveByX = Math.round(moveScalar * this.moveX)
			moveByY = Math.round(moveScalar * this.moveY)
		}

		let movingToX = fromX + moveByX
		let movingToY = fromY + moveByY
		if (tweening) {
			this.updatePosition(movingToX, movingToY)
		} else {
			let reachedApproximate = false
			const distX = this.destX - movingToX
			const distY = this.destY - movingToY
			if (Math.abs(distX) < COLLISION_DISTANCE && Math.abs(distY) < COLLISION_DISTANCE) {
				reachedApproximate = gameMath.pointDistance(movingToX, movingToY, this.destX, this.destY) <= COLLISION_DISTANCE
			}
			if (reachedApproximate) {
				this.reachedDestination(renderTime)
			} else {
				this.cX = movingToX
				this.cY = movingToY
				this.updatePosition(movingToX, movingToY)
			}
		}
	}

	updateTarget (force) {
		const targ = this.target
		if (!force && !targ.targetable) {
			this.unitTarget = false
			return
		}
		this.setDestination(targ.cX, targ.cY)
	}

}

//STATIC

Bullet.destroy = () => {
	allBullets = []
}

Bullet.update = (renderTime, timeDelta, tweening) => {
	if (!tweening) {
		for (let idx = allBullets.length - 1; idx >= 0; idx -= 1) {
			const bullet = allBullets[idx]
			if (bullet.remove) {
				allBullets.splice(idx, 1)
				render.remove(bullet.container)
			} else {
				bullet.updateTarget(false)
			}
		}
	}

	for (const bullet of allBullets) {
		bullet.move(renderTime, timeDelta, tweening)
		if (bullet.updateAnimations) {
			bullet.updateAnimations(renderTime)
		}
	}
}

export default Bullet
