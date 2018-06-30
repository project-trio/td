import { BoxBufferGeometry, ConeBufferGeometry, ExtrudeGeometry, PlaneBufferGeometry, RingBufferGeometry, SphereBufferGeometry, Mesh, MeshBasicMaterial, MeshLambertMaterial, Shape } from 'three'

import local from '@/xjs/local'
import store from '@/xjs/store'

import distance from '@/play/distance'
import render from '@/play/render'

import towers from '@/play/data/towers'

import Bullet from '@/play/entity/Bullet'
import Splash from '@/play/entity/Splash'
import Unit from '@/play/entity/Unit'
import Creep from '@/play/entity/Unit/Creep'

let TILE_SIZE

let allTowers = null

let backingGeometry, backingMaterial
let baseGeometry, baseMaterial
let turretGeometry, globeGeometry
let upgradeGeometry, upgradeSize

const rangesCache = {}
const turretMaterialsCache = {}
const rangeMaterial = new MeshBasicMaterial({ color: 0xffffff })
for (const name in towers) {
	if (name === 'names') {
		continue
	}
	const towerData = towers[name]
	const ranges = towerData.range
	turretMaterialsCache[name] = new MeshLambertMaterial({ color: towerData.color })
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
			this.targets = stats.targets
			this.crackle = false
			this.multi = stats.multi

			this.level = 0
			this.gold = stats.cost[0]
			this.damage = stats.damage[0]
			this.speed = stats.speed[0]
			this.range = stats.range[0]
			this.speedCheck = 2000 / this.speed
			this.rangeCheck = distance.checkRadius(this.range)
			if (stats.radius) {
				this.explosionRadius = stats.radius[0]
			}
			const slowStats = stats.slow
			if (slowStats) {
				this.slow = stats.slow[0]
			}
		}

		this.backing = new Mesh(backingGeometry, backingMaterial)
		this.backing.position.z = 1
		this.backing.receiveShadow = true
		this.backing.owner = this
		const outline = new Mesh(baseGeometry, baseMaterial)
		outline.castShadow = true
		this.container.add(this.backing)
		this.container.add(outline)

		this.top = render.group(this.container)
		let turret
		if (stats.targets) {
			turret = new Mesh(turretGeometry, turretMaterialsCache[name])
			turret.rotation.z = -Math.PI / 2
		} else {
			turret = new Mesh(globeGeometry, turretMaterialsCache[name])
		}
		turret.castShadow = true
		this.top.add(turret)

		this.top.rotation.z = Math.random() * Math.PI * 2
		this.top.position.z = 24
		if (live) {
			this.select(null)
			allTowers.push(this)
			local.syncTowers.push([ tX, tY, true ])
		}
	}

	deselect (manual) {
		const currentSelection = local.game.selection
		if (currentSelection) {
			const parent = currentSelection.mesh.parent
			if (parent) {
				parent.remove(currentSelection.mesh)
			}
			if (currentSelection.id === this.id) {
				if (this.name === 'snap') {
					this.crackle = true
					this.dead = true
				} else {
					local.game.selection = null
				}
				return manual
			}
		}
		return !manual
	}

	select (manual) {
		if (this.deselect(manual)) {
			return
		}

		const cacheGeometry = rangesCache[this.range]
		const selectionMesh = new Mesh(cacheGeometry, rangeMaterial)
		selectionMesh.position.z = 10
		this.container.add(selectionMesh)
		local.game.selection = {
			id: this.id,
			mesh: selectionMesh,
		}
	}

	onClick (point, button) {
		switch (button) {
		case 0:
			this.select(true)
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
		if (upgradeCost === undefined || upgradeCost > store.state.game.local.gold) {
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
			this.rangeCheck = distance.checkRadius(this.range)
			this.select(false)
		}
		if (this.explosionRadius) {
			this.explosionRadius += this.stats.radius[levelIndex]
		}
		if (this.slow) {
			this.slow += this.stats.slow[levelIndex]
		}

		const mesh = new Mesh(upgradeGeometry, turretMaterialsCache[this.name])
		mesh.position.x = (levelIndex - 1) * upgradeSize * 1.5
		mesh.castShadow = true
		// mesh.receiveShadow = true
		this.container.add(mesh)
	}

	//UPDATE

	destroy () {
		if (!this.crackle) {
			store.state.game.local.gold += this.gold
		}
		local.game.map.removeTower(this)
		local.syncTowers.push([ this.tX, this.tY, false ])

		super.destroy()
	}

	readyToFire (renderTime) {
		return this.firedAt + this.speedCheck < renderTime
	}

	bulletData () {
		return {
			attackBit: this.stats.attackBit,
			attackDamage: this.damage,
			bulletSpeed: this.stats.bulletSpeed,
			bulletAcceleration: this.stats.bulletAcceleration,
			explosionRadius: this.explosionRadius,
			slow: this.slow,
		}
	}

	fireAt (creep, data) {
		new Bullet(this, creep, data || this.bulletData(), this.container.parent)
	}

	update (renderTime, timeDelta, tweening) {
		if (this.targets) {
			this.updateTarget(renderTime, timeDelta, tweening)
		} else if (this.multi) {
			if (this.readyToFire(renderTime)) {
				const radiusCheck = this.rangeCheck
				const { cX, cY } = this
				let attackedCreep = false
				let creepsRemaining = this.multi
				let explodes = this.name === 'bash'
				const data = !explodes && this.bulletData()
				const attackBit = this.stats.attackBit
				for (const creep of Creep.all()) {
					if (!creep.spawningAt && (attackBit & creep.stats.attackBit) && creep.distanceTo(cX, cY) <= radiusCheck) {
						if (explodes) {
							creep.takeDamage(renderTime, this.damage, true)
							//TODO stun
						} else {
							this.fireAt(creep, data)
							if (creepsRemaining <= 1) {
								break
							}
							creepsRemaining -= 1
						}
						attackedCreep = true
					}
				}
				if (attackedCreep) {
					this.firedAt = renderTime
					if (explodes) {
						new Splash(renderTime, this, null, this.explosionRadius, this.container)
					}
				}
			}
		}
	}

	updateTarget (renderTime, timeDelta, tweening) {
		const cX = this.cX, cY = this.cY
		if (!tweening) {
			const attackBit = this.stats.attackBit
			if (this.target) {
				if (this.target.healthScheduled <= 0 || this.target.distanceTo(cX, cY) > this.rangeCheck) {
					this.target = null
				}
			}
			if (!this.target) {
				let newTarget = null
				let nearestDistance = this.rangeCheck + 1
				for (const creep of Creep.all()) {
					if (!creep.spawningAt && creep.healthScheduled > 0 && (attackBit & creep.stats.attackBit) && (!this.slow || !creep.immune)) {
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
			if (this.target && this.readyToFire(renderTime)) {
				this.firedAt = renderTime
				this.fireAt(this.target, null)
			}
		}
		if (this.target) {
			const targetPosition = this.target.container.position
			this.top.rotation.z = Math.atan2(targetPosition.y - cY, targetPosition.x - cX)
		}
	}

	pop () {
		let hasTarget = false
		const { cX, cY } = this
		const data = this.bulletData()
		for (const creep of Creep.all()) {
			if (creep.distanceTo(cX, cY) <= this.rangeCheck) {
				hasTarget = true
				this.fireAt(creep, data)
			}
		}
		return hasTarget
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

Tower.init = (_tileSize) => {
	TILE_SIZE = _tileSize
	allTowers = []

	upgradeSize = TILE_SIZE / 5
	const ugpradeOffset = -TILE_SIZE / 2 - upgradeSize / 2
	upgradeGeometry = new BoxBufferGeometry(upgradeSize, upgradeSize * 2 / 3, 15)
	upgradeGeometry.translate(ugpradeOffset, ugpradeOffset * 4 / 3 + 4, 5)

	backingGeometry = new PlaneBufferGeometry(TILE_SIZE * 2 - 8, TILE_SIZE * 2 - 8)
	backingMaterial = new MeshLambertMaterial({ color: 0xafbbaf })

	const outlineSize = TILE_SIZE * 2 - 4
	const outlineRadius = Math.floor(TILE_SIZE / 4)
	const holeShape = roundedRect(outlineSize - TILE_SIZE / 4, outlineRadius / 2 - 2)
	const baseShape = roundedRect(outlineSize, outlineRadius / 2)
	baseShape.holes.push(holeShape)
	baseGeometry = new ExtrudeGeometry(baseShape, { depth: 16, bevelEnabled: false })
	baseMaterial = new MeshLambertMaterial({ color: 0x333333 })

	const turretLength = TILE_SIZE * 1.5
	turretGeometry = new ConeBufferGeometry(TILE_SIZE / 3, turretLength,  TILE_SIZE / 4)
	turretGeometry.translate(0, turretLength / 2 - 4, 0)
	globeGeometry = new SphereBufferGeometry(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2)
}

Tower.destroy = () => {
	allTowers = null
}

Tower.update = (renderTime, timeDelta, tweening) => {
	for (let idx = allTowers.length - 1; idx >= 0; idx -= 1) {
		const tower = allTowers[idx]
		if (tower.dead) {
			const selection = local.game.selection
			if (selection && selection.id === tower.id) {
				local.game.selection = null
			}
			if (tower.crackle && !tower.pop()) {
				tower.crackle = false
				tower.dead = false
				continue
			}
			tower.destroy(renderTime)
			allTowers.splice(idx, 1)
		} else if (renderTime !== null) {
			tower.update(renderTime, timeDelta, tweening)
		}
	}
}
