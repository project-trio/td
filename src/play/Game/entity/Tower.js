import render from '@/play/render'

import Unit from '@/play/Game/entity/Unit'

export default class Tower extends Unit {

	constructor (x, y, parent, live) {
		super(parent, live)

		this.container.position.x = x
		this.container.position.y = y
		this.cY = x
		this.cY = y

		const diameter = 64
		render.rectangle(diameter, diameter, { color: 0x333333, parent: this.container })
	}

	update (timeDelta, tweening) {

	}

}
