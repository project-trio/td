import { BoxBufferGeometry, ExtrudeGeometry, PlaneBufferGeometry, RingBufferGeometry, WireframeGeometry, LineSegments, Mesh, MeshBasicMaterial, MeshLambertMaterial, Shape } from 'three'

import store from '@/xjs/store'

import distance from '@/play/distance'
import local from '@/play/local'
import render from '@/play/render'

import towers from '@/play/data/towers'

import Bullet from '@/play/entity/Bullet'
import Splash from '@/play/entity/Splash'
import Unit from '@/play/entity/Unit'
import Creep from '@/play/entity/Unit/Creep'

import Vox from '@/play/external/vox'

const BASE_HEIGHT = 16

let TILE_SIZE

let allTowers = null

let backingGeometry, backingMaterial
let baseGeometry, baseMaterial
let upgradeGeometry, upgradeSize

const rangesCache = {}
const turretMaterialsCache = {}
const turretModelBuilders = {}
const rangeMaterial = new MeshBasicMaterial({ color: 0xeeeeee })
const wireMaterials = {}
{
	const voxParser = new Vox.Parser()
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
		if (turretModelBuilders[name] !== undefined) {
			continue
		}
		wireMaterials[towerData.wire] = new MeshBasicMaterial({ color: towerData.wire })
		store.state.loading += 1
		turretModelBuilders[name] = null
		voxParser.parse(require(`@/assets/towers/${name}.vox`)).then((voxelData) => {
			store.state.loading -= 1
			turretModelBuilders[name] = new Vox.MeshBuilder(voxelData, { voxelSize: 2 })
		})
	}
}

const createTurret = (stats, outlined) => {
	const turret = turretModelBuilders[stats.name].createMesh()
	const wireframe = new WireframeGeometry(turret.geometry)
	const line = new LineSegments(wireframe, wireMaterials[stats.wire])
	if (!outlined) {
		line.material = line.material.clone()
		line.material.color.setHex(stats.color)
		line.rotation.x = Math.PI / 2
		return line
	}

	turret.material = turret.material.clone() //TODO
	turret.material.color.setHex(stats.color)

	turret.add(line)
	turret.rotation.x = Math.PI / 2
	return turret
}

const removeSelection = () => {
	local.game.selection = null
	store.state.game.selection = null
}

const updateBoost = () => {
	const towerCount = allTowers.length
	for (let tidx = 0; tidx < towerCount; tidx += 1) {
		const targetTower = allTowers[tidx]
		if (targetTower.isBoost) {
			continue
		}
		let boosting = 0
		for (let bidx = 0; bidx !== tidx && bidx < towerCount; bidx += 1) {
			const boostTower = allTowers[bidx]
			if (!boostTower.isBoost) {
				continue
			}
			const dtX = boostTower.tX - targetTower.tX
			if (dtX < -2 || dtX > 2) {
				continue
			}
			const dtY = boostTower.tY - targetTower.tY
			if (dtY < -2 || dtY > 2) {
				continue
			}
			boosting += boostTower.damage
		}
		if (targetTower.boosted !== boosting) {
			targetTower.boosted = boosting
			targetTower.updateDamage()
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
			this.crackle = name === 'snap' ? false : null
			this.isBoost = name === 'boost'
			this.multi = stats.multi
			if (this.isBoost) {
				this.damageCheck = 0
			}

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
			if (stats.slow) {
				this.slow = stats.slow[0]
			}
			if (stats.stun) {
				this.stun = stats.stun[0]
			}

			this.backing = new Mesh(backingGeometry, backingMaterial)
			this.backing.position.z = 2
			this.backing.receiveShadow = true
			this.backing.owner = this
			this.container.add(this.backing)
		}

		const outline = new Mesh(baseGeometry, baseMaterial)
		outline.castShadow = true
		// outline.receiveShadow = true
		this.container.add(outline)

		this.top = render.group(this.container)
		const turret = createTurret(stats, true)
		turret.castShadow = true
		this.top.add(turret)
		if (stats.targets) {
			this.top.rotation.z = Math.random() * Math.PI * 2
			// this.top.rotation.z = Math.PI * 7 / 4 //SAMPLE
		}
		// this.top.position.z = BASE_HEIGHT + 1

		if (live) {
			this.select(true)
			allTowers.push(this)
			local.syncTowers.push([ tX, tY, true ])
			updateBoost()
		}
	}

	updateDamage () {
		this.damageCheck = this.damage * this.boosted / 100 + this.damage
	}

	detonate () {
		if (this.crackle !== false) {
			return false
		}
		this.crackle = true
		this.dead = true
		return true
	}

	deselect (manual) {
		const currentSelection = local.game.selection
		if (currentSelection) {
			const parent = currentSelection.mesh.parent
			if (parent) {
				parent.remove(currentSelection.mesh)
			}
			if (currentSelection.id === this.id) {
				if (!manual || !this.detonate()) {
					removeSelection()
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
		selectionMesh.position.z = 1
		this.container.add(selectionMesh)
		local.game.selection = {
			id: this.id,
			tower: this,
			mesh: selectionMesh,
		}
		store.state.game.selection = {
			id: this.id,
			name: this.name,
			level: this.level,
		}
	}

	onHover () {
		document.body.style.cursor = 'pointer'
	}
	onBlur () {
		document.body.style.cursor = null
	}

	onClick (point, button) {
		switch (button) {
		case 0:
			this.select(true)
			break
		case 1:
			this.sell()
			break
		case 2:
			this.upgrade()
			break
		}
		return true
	}

	sell () {
		this.dead = true
	}

	upgrade () {
		const levelIndex = this.level + 1
		const upgradeCost = this.stats.cost[levelIndex]
		if (upgradeCost === undefined || upgradeCost > store.state.game.local.gold) {
			return
		}
		store.state.game.local.gold -= upgradeCost
		const storeSelection = store.state.game.selection
		if (storeSelection && storeSelection.id === this.id) {
			storeSelection.level = levelIndex
		}

		this.level = levelIndex
		this.gold += upgradeCost
		this.damage += this.stats.damage[levelIndex]
		if (this.isBoost) {
			updateBoost()
		} else {
			this.updateDamage()
		}
		this.speed += this.stats.speed[levelIndex]
		const rangeDiff = this.stats.range[levelIndex]
		if (rangeDiff !== 0) {
			this.range += rangeDiff
			this.rangeCheck = distance.checkRadius(this.range)
			this.select(false)
		}
		if (this.explosionRadius) {
			this.explosionRadius += this.stats.radius[levelIndex]
		}
		if (this.stats.slow) {
			this.slow += this.stats.slow[levelIndex]
		}
		if (this.stats.stun) {
			this.stun += this.stats.stun[levelIndex]
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
			attackDamage: this.damageCheck,
			bulletSpeed: this.stats.bulletSpeed,
			bulletAcceleration: this.stats.bulletAcceleration,
			explosionRadius: this.explosionRadius,
			slow: this.slow,
			stun: this.stun,
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
				const { cX, cY, rangeCheck } = this
				let attackedCreep = false
				let creepsRemaining = this.multi
				let explodes = this.name === 'bash'
				const data = !explodes && this.bulletData()
				const attackBit = this.stats.attackBit
				const stunDuration = this.stun && this.stun * 1000
				for (const creep of Creep.all()) {
					if (!creep.spawningAt && (attackBit & creep.stats.attackBit) && creep.distanceTo(cX, cY) <= rangeCheck) {
						attackedCreep = true
						if (explodes) {
							creep.takeDamage(renderTime, this.damageCheck, true, stunDuration)
						} else {
							this.fireAt(creep, data)
							if (creepsRemaining <= 1) {
								break
							}
							creepsRemaining -= 1
						}
					}
				}
				if (attackedCreep) {
					this.firedAt = renderTime
					if (explodes) {
						new Splash(renderTime, this, null, this.range, this.container)
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

Tower.init = (_tileSize, placeholder) => {
	TILE_SIZE = _tileSize
	allTowers = []

	upgradeSize = TILE_SIZE / 5
	const ugpradeOffset = -TILE_SIZE / 2 - upgradeSize / 2
	upgradeGeometry = new BoxBufferGeometry(upgradeSize, upgradeSize * 2 / 3, 15)
	upgradeGeometry.translate(ugpradeOffset, ugpradeOffset * 4 / 3 + 3, 5)

	const outlineSize = TILE_SIZE * 2 - 4
	const backingSize = outlineSize - 1
	backingGeometry = new PlaneBufferGeometry(backingSize, backingSize)
	backingMaterial = new MeshLambertMaterial({ color: 0xaaaaaa })
	backingMaterial.transparent = true
	backingMaterial.opacity = 0.5

	const outlineRadius = Math.floor(TILE_SIZE / 3)
	const baseShape = roundedRect(outlineSize, outlineRadius / 2)
	const holeShape = roundedRect(outlineSize - 4, outlineRadius / 2 - 2)
	baseShape.holes.push(holeShape)
	baseGeometry = new ExtrudeGeometry(baseShape, { depth: BASE_HEIGHT, bevelEnabled: false })
	baseMaterial = new MeshLambertMaterial({ color: 0xbbbbbb })

	const towerPlaceholders = {}
	const outlineMaterial = new MeshBasicMaterial({ color: 0xdddddd })
	const outlineWireframe = new WireframeGeometry(baseGeometry)
	const outlineLine = new LineSegments(outlineWireframe, outlineMaterial)
	placeholder.add(outlineLine)

	const rangeMaterialTransparent = rangeMaterial.clone()
	rangeMaterialTransparent.transparent = true
	rangeMaterialTransparent.opacity = 0.5

	for (const name in towers) {
		if (name !== 'names') {
			const towerData = towers[name]
			const turretGroup = render.group(placeholder)
			const turret = createTurret(towerData, false)
			turret.material.transparent = true
			turret.material.opacity = name === 'swarm' ? 0.5 : 0.33

			const rangeGeometry = rangesCache[towerData.range[0]]
			const rangeMesh = new Mesh(rangeGeometry, rangeMaterialTransparent)
			rangeMesh.position.z = 1
			turretGroup.add(rangeMesh)

			turretGroup.add(turret)
			placeholder.add(turretGroup)
			turretGroup.visible = false
			turretGroup.targets = towerData.targets
			towerPlaceholders[name] = turretGroup
		}
	}
	placeholder.towers = towerPlaceholders
}

Tower.destroy = () => {
	allTowers = null
}

Tower.update = (renderTime, timeDelta, tweening) => {
	for (let idx = allTowers.length - 1; idx >= 0; idx -= 1) {
		const tower = allTowers[idx]
		if (tower.dead) {
			if (tower.crackle && !tower.pop()) {
				tower.crackle = false
				tower.dead = false
				continue
			}
			const selection = local.game.selection
			if (selection && selection.id === tower.id) {
				removeSelection()
			}
			tower.destroy(renderTime)
			allTowers.splice(idx, 1)
			if (tower.isBoost) {
				updateBoost()
			}
		} else if (renderTime !== null) {
			tower.update(renderTime, timeDelta, tweening)
		}
	}
}
