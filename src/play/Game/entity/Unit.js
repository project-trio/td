import render from '@/play/render'

let allUnits = []

class Unit {

	constructor (x, y, parent) {
		this.container = render.group(parent)
		this.container.position.x = x
		this.container.position.y = y

		allUnits.push(this)
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
}

export default Unit
