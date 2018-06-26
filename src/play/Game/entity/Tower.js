import render from '@/play/render'

import Unit from '@/play/Game/entity/Unit'

import local from '@/xjs/local'

export default class Tower extends Unit {

	constructor (x, y, parent, live) {
		super(parent, live)

		this.container.position.x = x
		this.container.position.y = y
		this.cX = x
		this.cY = y

		const diameter = 64
		this.backing = render.rectangle(diameter, diameter, { color: 0x333333, parent: this.container })
		this.backing.owner = this
	}

	onClick (point, rightClick) {
		if (rightClick) {
			this.dead = true
		}
		return true
	}

	//UPDATE

	destroy () {
		local.game.map.removeTower(this)
		render.remove(this.backing)
	}

	update (timeDelta, tweening) {
	}

}
