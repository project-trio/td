import render from '@/play/render'

import Unit from '@/play/Game/entity/Unit'

export default class Tower extends Unit {

	constructor (x, y, parent) {
		super(x, y, parent)

		const diameter = 64
		render.rectangle(diameter, diameter, { color: 0x333333, parent: this.container })
	}

}
