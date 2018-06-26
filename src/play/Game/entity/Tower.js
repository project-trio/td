import * as THREE from 'three'

import render from '@/play/render'

import Unit from '@/play/Game/entity/Unit'

import local from '@/xjs/local'

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
		render.remove(this.container)
	}

	update (timeDelta, tweening) {
	}

}

//STATIC

Tower.init = (tileSize) => {
	backingGeometry = new THREE.PlaneBufferGeometry(tileSize * 2 - 8, tileSize * 2 - 8)
	backingMaterial = new THREE.MeshLambertMaterial({ color: 0xaabbaa })

	const baseShape = new THREE.Shape()
	const hole = new THREE.Shape()
	roundedRectOf(baseShape, 54, 4)
	roundedRectOf(hole, 54, 8)
	baseShape.holes.push(hole)
	baseGeometry = new THREE.ExtrudeGeometry(baseShape, { depth: 0 })
	baseMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 })
}
