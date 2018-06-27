import * as THREE from 'three'

import Unit from '@/play/Game/entity/Unit'

import render from '@/play/render'

import towers from '@/play/data/towers'

import gameMath from '@/play/Game/math'

import Bullet from '@/play/Game/entity/Bullet'

import local from '@/xjs/local'
import store from '@/xjs/store'

let backingGeometry, backingMaterial
let baseGeometry, baseMaterial

const rangesCache = {}
const rangeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
for (const name in towers) {
	if (name === 'names') {
		continue
	}
	const towerData = towers[name]
	const ranges = towerData.range
	let range = 0
	for (const diff of ranges) {
		if (diff) {
			range += diff
			if (!rangesCache[range]) {
				rangesCache[range] = new THREE.RingBufferGeometry(range * 2, range * 2 + 1, range)
			}
		}
	}
}

export default class Tower extends Unit {

	constructor (name, stats, x, y, parent, live) {
		super(parent, live)

		this.id = `${x},${y}`
		this.container.position.x = x
		this.container.position.y = y
		this.cX = x
		this.cY = y

		this.target = null
		this.firedAt = 0

		this.name = name
		this.stats = stats
		this.level = 0
		this.gold = stats.cost[0]
		this.damage = stats.damage[0]
		this.range = stats.range[0]
		this.speed = stats.speed[0]
		this.bulletSpeed = stats.bulletSpeed
		this.bulletAcceleration = stats.bulletAcceleration
		this.rangeCheck = gameMath.squared(this.range * 2)

		this.backing = new THREE.Mesh(backingGeometry, backingMaterial)
		this.backing.owner = this
		const outline = new THREE.Mesh(baseGeometry, baseMaterial)
		this.container.add(this.backing)
		this.container.add(outline)

		this.select()
	}

	select () {
		const currentSelection = local.game.selection
		if (currentSelection) {
			if (currentSelection.mesh) {
				render.remove(currentSelection.mesh)
			}
			if (currentSelection.id === this.id) {
				local.game.selection = null
				return
			}
		}
		const cacheGeometry = rangesCache[this.range]
		const selection = new THREE.Mesh(cacheGeometry, rangeMaterial)
		selection.position.z = 10
		this.container.add(selection)
		local.game.selection = {
			id: this.id,
			mesh: selection,
		}
	}

	onClick (point, rightClick) {
		if (rightClick) {
			this.dead = true
			return true
		}
		this.select()
		return true
	}

	upgrade () {
		this.level += 1
		this.gold += this.stats.cost[this.level]
		this.damage += this.stats.damage[this.level]
		this.speed += this.stats.range[this.level]
		const rangeDiff = this.stats.range[this.level]
		if (rangeDiff !== 0) {
			this.range += rangeDiff
			this.rangeCheck = gameMath.squared(this.range * 2)
		}
	}

	//UPDATE

	destroy () {
		store.state.game.local.gold += this.gold
		local.game.map.removeTower(this)
		super.destroy()
	}

	update (renderTime, timeDelta, tweening) {
		if (!tweening) {
			const attackBit = this.stats.attackBit
			const cX = this.cX, cY = this.cY
			if (this.target) {
				if (this.target.dead || this.target.distanceTo(cX, cY) > this.rangeCheck) {
					this.target = null
				}
			}
			if (!this.target) {
				let newTarget = null
				let nearestDistance = this.rangeCheck + 1
				for (const unit of Unit.all()) {
					if (unit.creep && (attackBit & unit.stats.attackBit)) {
						const distance = unit.distanceTo(cX, cY)
						if (distance < nearestDistance) {
							newTarget = unit
							nearestDistance = distance
						}
					}
				}
				if (newTarget) {
					this.target = newTarget
				}
			}
			if (this.target) {
				if (this.firedAt + this.speed * 1000 < renderTime) {
					this.firedAt = renderTime
					const data = {
						attackDamage: this.damage,
						bulletSpeed: this.bulletSpeed,
						bulletAcceleration: this.bulletAcceleration,
					}
					new Bullet(this, this.target, data, this.container.parent)
				}
			}
		}
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
