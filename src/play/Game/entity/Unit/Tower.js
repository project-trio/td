import * as THREE from 'three'

import Unit from '@/play/Game/entity/Unit'

import local from '@/xjs/local'

let backingGeometry, backingMaterial
let baseGeometry, baseMaterial

export default class Tower extends Unit {

	constructor (x, y, parent, live) {
		super(parent, live)

		this.container.position.x = x
		this.container.position.y = y
		this.cX = x
		this.cY = y

		this.backing = new THREE.Mesh(backingGeometry, backingMaterial)
		this.backing.owner = this
		const outline = new THREE.Mesh(baseGeometry, baseMaterial)
		this.container.add(this.backing)
		this.container.add(outline)
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
		super.destroy()
	}

	update (timeDelta, tweening) {
	}

}

//STATIC

const roundedRectOf = (o, width, r) => {
	const wh = width / 2
	const sh = wh - r
	o.moveTo(0, -wh)
	o.moveTo(sh, -wh)
	o.quadraticCurveTo(wh, -wh, wh, -sh)
	o.moveTo(wh, sh)
	o.quadraticCurveTo(wh, wh, sh, wh)
	o.moveTo(-sh, wh)
	o.quadraticCurveTo(-wh, wh, -wh, sh)
	o.moveTo(-wh, -sh)
	o.quadraticCurveTo(-wh, -wh, -sh, -wh)
	o.moveTo(0, -wh)
}

Tower.init = (tileSize) => {
	backingGeometry = new THREE.PlaneBufferGeometry(tileSize * 2 - 8, tileSize * 2 - 8)
	backingMaterial = new THREE.MeshLambertMaterial({ color: 0xaabbaa })

	const baseShape = new THREE.Shape()
	const hole = new THREE.Shape()
	const outlineSize = tileSize * 2 - 10
	const outlineRadius = Math.floor(tileSize / 4)
	roundedRectOf(baseShape, outlineSize, outlineRadius / 2)
	roundedRectOf(hole, outlineSize, outlineRadius)
	baseShape.holes.push(hole)
	baseGeometry = new THREE.ExtrudeGeometry(baseShape, { depth: 0 })
	baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
}
