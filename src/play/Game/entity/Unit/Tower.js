import { ConeBufferGeometry, ExtrudeGeometry, PlaneBufferGeometry, RingBufferGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, Shape } from 'three'

import Unit from '@/play/Game/entity/Unit'
import Creep from '@/play/Game/entity/Unit/Creep'

import render from '@/play/render'

import towers from '@/play/data/towers'

import gameMath from '@/play/Game/math'

import Bullet from '@/play/Game/entity/Bullet'

import local from '@/xjs/local'
import store from '@/xjs/store'

let allTowers = null

let backingGeometry, backingMaterial
let baseGeometry, baseMaterial
let turretGeometry

const rangesCache = {}
const materialsCache = {}
const rangeMaterial = new MeshBasicMaterial({ color: 0xffffff })
for (const name in towers) {
	if (name === 'names') {
		continue
	}
	const towerData = towers[name]
	const ranges = towerData.range
	materialsCache[name] = new MeshBasicMaterial({ color: towerData.color })
	let range = 0
	for (const diff of ranges) {
		if (diff) {
			range += diff
			if (!rangesCache[range]) {
				rangesCache[range] = new RingBufferGeometry(range * 2, range * 2 + 1, range)
			}
		}
	}
}

export default class Tower extends Unit {

	constructor (name, stats, parent, tX, tY, x, y) {
		const live = tX !== undefined
		super(parent, live)

		this.name = name
		this.stats = stats

		if (live) {
			this.id = `${tX},${tY}`
			this.tX = tX
			this.tY = tY
			this.container.position.x = x
			this.container.position.y = y
			this.cX = x
			this.cY = y

			this.target = null
			this.firedAt = 0

			this.level = 0
			this.gold = stats.cost[0]
			this.damage = stats.damage[0]
			this.speed = stats.speed[0]
			this.range = stats.range[0]
			this.speedCheck = (10 - this.speed) * 100
			this.rangeCheck = gameMath.checkRadius(this.range)
			if (stats.radius) {
				this.explosionRadius = stats.radius[0]
			}
		}

		this.backing = new Mesh(backingGeometry, backingMaterial)
		this.backing.owner = this
		const outline = new Mesh(baseGeometry, baseMaterial)
		this.top = new Mesh(turretGeometry, materialsCache[name])
		this.top.rotation.z = Math.random() * Math.PI * 2
		this.top.position.z = 10
		this.container.add(this.backing)
		this.container.add(outline)
		this.container.add(this.top)

		if (live) {
			this.select()
			allTowers.push(this)
			local.syncTowers.push([ tX, tY, true ])
		}
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
		const selection = new Mesh(cacheGeometry, rangeMaterial)
		selection.position.z = 10
		this.container.add(selection)
		local.game.selection = {
			id: this.id,
			mesh: selection,
		}
	}

	onClick (point, button) {
		switch (button) {
		case 0:
			this.select()
			break
		case 1:
			this.dead = true
			break
		case 2:
			this.upgrade()
			break
		}
		return true
	}

	upgrade () {
		const levelIndex = this.level + 1
		const upgradeCost = this.stats.cost[levelIndex]
		if (upgradeCost > store.state.game.local.gold) {
			return
		}
		store.state.game.local.gold -= upgradeCost

		this.level = levelIndex
		this.gold += upgradeCost
		this.damage += this.stats.damage[levelIndex]
		this.speed += this.stats.range[levelIndex]
		const rangeDiff = this.stats.range[levelIndex]
		if (rangeDiff !== 0) {
			this.range += rangeDiff
			this.rangeCheck = gameMath.checkRadius(this.range)
		}
		if (this.explosionRadius) {
			this.explosionRadius += this.stats.radius[levelIndex]
		}
	}

	//UPDATE

	destroy () {
		store.state.game.local.gold += this.gold
		local.game.map.removeTower(this)
		local.syncTowers.push([ this.tX, this.tY, false ])

		super.destroy()
	}

	update (renderTime, timeDelta, tweening) {
		if (!tweening) {
			const attackBit = this.stats.attackBit
			const cX = this.cX, cY = this.cY
			if (this.target) {
				if (this.target.healthScheduled <= 0 || this.target.distanceTo(cX, cY) > this.rangeCheck) {
					this.target = null
				}
			}
			if (!this.target) {
				let newTarget = null
				let nearestDistance = this.rangeCheck + 1
				for (const creep of Creep.all()) {
					if (creep.healthScheduled > 0 && (attackBit & creep.stats.attackBit)) {
						const distance = creep.distanceTo(cX, cY)
						if (distance < nearestDistance) {
							newTarget = creep
							nearestDistance = distance
						}
					}
				}
				if (newTarget) {
					this.target = newTarget
				}
			}
			if (this.target) {
				this.top.rotation.z = Math.atan2(this.target.cY - cY, this.target.cX - cX) - Math.PI / 2
				if (this.firedAt + this.speedCheck < renderTime) {
					this.firedAt = renderTime
					const data = {
						attackDamage: this.damage,
						bulletSpeed: this.stats.bulletSpeed,
						bulletAcceleration: this.stats.bulletAcceleration,
						explosionRadius: this.explosionRadius,
					}
					new Bullet(this, this.target, data, this.container.parent)
				}
			}
		}
	}

}

//STATIC

const roundedRect = (width, r) => {
	const o = new Shape()
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
	return o
}

Tower.init = (tileSize) => {
	allTowers = []

	backingGeometry = new PlaneBufferGeometry(tileSize * 2 - 8, tileSize * 2 - 8)
	backingMaterial = new MeshLambertMaterial({ color: 0xafbbaf })

	const outlineSize = tileSize * 2 - 10
	const outlineRadius = Math.floor(tileSize / 4)
	const holeShape = roundedRect(outlineSize+6, outlineRadius)
	const baseShape = roundedRect(0, outlineRadius / 2)
	// roundedRectOf(hole, outlineSize, outlineRadius)
	// roundedRectOf(baseShape, outlineSize, outlineRadius / 2)
	baseShape.holes.push(holeShape)
	baseGeometry = new ExtrudeGeometry(baseShape, { depth: 0 })
	baseMaterial = new MeshBasicMaterial({ color: 0x333333 })

	const turretLength = tileSize * 1.5
	turretGeometry = new ConeBufferGeometry(tileSize / 3, turretLength,  tileSize / 4)
	turretGeometry.translate(0, turretLength / 2 - 6, 0)
}

Tower.destroy = function () {
	allTowers = null
}

Tower.update = function (renderTime, timeDelta, tweening) {
	for (let idx = allTowers.length - 1; idx >= 0; idx -= 1) {
		const tower = allTowers[idx]
		if (tower.dead) {
			tower.destroy(renderTime)
			allTowers.splice(idx, 1)
		} else {
			tower.update(renderTime, timeDelta, tweening)
		}
	}
}
