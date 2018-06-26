import render from '@/play/render'

let allUnits = []

class Unit {

	constructor (parent, live) {
		this.container = render.group(parent)

		this.currentIndex = null
		this.destinationIndex = null

		if (live) {
			allUnits.push(this)
		}
	}

	distanceTo (x, y) {
		const diffX = x - this.cX
		const diffY = y - this.cY
		return diffX * diffX + diffY * diffY
	}

}

//STATIC

Unit.destroy = function () {
	allUnits = []
}

Unit.all = function () {
	return allUnits
}

Unit.get = function (id) {
	for (const unit of allUnits) {
		if (unit.id === id) {
			return unit
		}
	}
	console.error('Target id not found', id, allUnits.map(unit => unit.id))
}

Unit.update = function (renderTime, timeDelta, tweening) {
	for (const unit of allUnits) {
		unit.update(timeDelta, tweening)
	}
}

export default Unit
