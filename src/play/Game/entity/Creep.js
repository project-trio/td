import render from '@/play/render'

import Unit from '@/play/Game/entity/Unit'

export default class Tower extends Unit {

	constructor (x, y, parent) {
		super(x, y, parent)

		render.circle(16, { color: 0x6688ee, parent: this.container })
	}

}
