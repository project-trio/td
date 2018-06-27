import render from '@/play/render'

import Unit from '@/play/Game/entity/Unit'

import store from '@/xjs/store'

const PId2 = Math.PI / 2
const MOVE_DIVISOR = 15
const DIAGONAL_DISTANCE = Math.cos(PId2 / 2)
const START_DISTANCE = 64
const MOVEMENT_PADDING = 2

let gameMap, creepSize

export default class Creep extends Unit {

	constructor (data, entranceIndex, vertical, wave) {
		const live = data !== undefined
		super(gameMap.container, live)

		if (live) {
			this.id = `${wave}${data.name}${vertical}`
			this.name = data.name

			this.speed = data.speed
			this.vertical = vertical
			this.currentIndex = null
			this.setDestination(entranceIndex)
			const startX = this.destinationX - (vertical ? 0 : START_DISTANCE)
			const startY = this.destinationY + (vertical ? START_DISTANCE : 0)
			this.container.position.x = startX
			this.container.position.y = startY
			this.cX = startX
			this.cY = startY
			this.setMovement(1 - vertical, vertical)
			this.container.rotation.z = this.destinationAngle
		}

		render.circle(creepSize, { color: 0x6688ee, parent: this.container })
	}

	update (timeDelta, tweening) {
		if (!tweening) {
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
		const diffX = this.moveX * this.speed * timeDelta / MOVE_DIVISOR
		const diffY = this.moveY * this.speed * timeDelta / MOVE_DIVISOR
		const positionX = startX + diffX
		const positionY = startY + diffY

		if (!this.currentIndex) {
			const escaped = this.vertical
					? positionY < gameMap.killY
					: positionX > gameMap.killX
			if (escaped) {
				this.dead = true
				store.state.game.local.lives -= 1
			}
		}

		this.container.position.x = positionX
		this.container.position.y = positionY
		if (!tweening) {
			this.cX = positionX
			this.cY = positionY
		}
	}

	// destroy () {
	// 	super.destroy()
	// }

	// Path

	setDestination (index) {
		this.destinationIndex = index
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

Creep.init = (map, tileSize) => {
	gameMap = map
	creepSize = tileSize / 2 - 1
}

Creep.destroy = () => {
	gameMap = null
}
