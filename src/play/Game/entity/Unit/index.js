import render from '@/play/render'

export default class Unit {

	constructor (parent) {
		this.container = render.group(parent)
	}

	distanceTo (x, y) {
		const diffX = x - this.cX
		const diffY = y - this.cY
		return diffX * diffX + diffY * diffY
	}

	destroy (_renderTime) {
		render.remove(this.container)
	}

}
