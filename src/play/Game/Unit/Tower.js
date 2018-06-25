import render from '@/play/render'

export default class Tower {

	constructor (x, y, parent) {
		this.container = render.group(parent)
		this.container.position.x = x
		this.container.position.y = y
		const diameter = 64
		render.rectangle(diameter, diameter, { color: 0x333333, parent: this.container })
	}

}
