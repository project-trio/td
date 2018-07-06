import bridge from '@/xjs/bridge'
import store from '@/xjs/store'

import random from '@/play/random'

import creeps from '@/play/data/creeps'

import Creep from '@/play/entity/Unit/Creep'

const CREEP_TYPE_COUNT = creeps.length
const WAVES_PER_GOLD = 8

export default class Waves {

	constructor (spawnPoints, totalWaveCount, creepMode) {
		this.spawning = []
		this.count = 0
		this.spawnPoints = spawnPoints
		this.waveStart = 0
		this.creepCount = 0
		this.max = totalWaveCount
		const creepIndicies = []
		for (let waveIndex = 0; waveIndex < totalWaveCount; waveIndex += 1) {
			let creepIndex
			if (creepMode === 'random') {
				creepIndex = random.index(waveIndex < WAVES_PER_GOLD ? 4 : CREEP_TYPE_COUNT)
			} else if (creepMode === 'spawn') {
				creepIndex = 5
			} else {
				creepIndex = waveIndex % CREEP_TYPE_COUNT
				if (waveIndex < WAVES_PER_GOLD && creepIndex === 4) { //SAMPLE
					creepIndex = 0
				}
			}
			// creepIndex = 5 //SAMPLE
			const wave = waveIndex + 1
			let boss
			if (wave === 49) {
				boss = true
			} else {
				boss = wave % WAVES_PER_GOLD === 0
			}
			// boss = true //SAMPLE
			creepIndicies[waveIndex] = [ creepIndex, boss ]
			// console.log(wave, creeps[creepIndex].name, boss)
		}
		this.creepIndicies = creepIndicies
	}

	spawn (renderTime) {
		const waveNumber = this.count + 1
		if (waveNumber > this.max) {
			return console.log('Waves finished')
		}
		store.state.game.wave = waveNumber
		this.count = waveNumber
		const waveIndex = waveNumber - 1
		const [ creepIndex, boss ] = this.creepIndicies[waveIndex]
		const data = creeps[creepIndex]
		const grouped = data.grouped

		const speed = (data.speed || 1) * (boss ? 0.8 : 1)
		const healthMultiplier = data.health ? data.health[boss ? 1 : 0] : (boss ? 12 : 1)
		const health = Math.round(Math.pow(1.11, waveIndex) * 20 * healthMultiplier)
		const waveSize = boss ? (grouped ? 3 : 1) : (data.count || 10)
		// const waveSize = 1 //SAMPLE
		let gold = Math.ceil(waveNumber / 8)
		if (boss) {
			gold *= grouped ? 6 : 20
		} else if (data.gold) {
			gold *= data.gold
		}
		const children = data.name === 'spawn' ? (boss ? 6 : 2) : 0
		let waveCount = waveSize * (children + 1) * 2
		store.state.game.waveCreepCount = waveCount
		this.creepCount += waveCount
		this.waveStart = renderTime

		this.spawning.push({
			index: 0,
			startAt: renderTime,
			model: data.model,
			color: data.color,
			name: data.name,
			count: waveSize,
			speed,
			health,
			gold,
			boss,
			children,
			grouped: grouped,
			attackBit: data.attackBit,
		})
		// console.log('Wave', this.count, data)
	}

	update (renderTime) {
		const waveNumber = this.count
		const spawning = this.spawning
		for (let sidx = spawning.length - 1; sidx >= 0; sidx -= 1) {
			const spawnData = spawning[sidx]
			if (renderTime >= spawnData.startAt + spawnData.index * (spawnData.grouped ? 50 : 500)) {
				if (spawnData.index >= spawnData.count - 1) {
					spawning.splice(sidx, 1)
				} else {
					spawnData.index += 1
				}
				for (let vertical = 0; vertical < 2; vertical += 1) {
					let spawnPoints = this.spawnPoints[vertical]
					if (spawnData.grouped) {
						const center = Math.floor(spawnPoints.length / 2)
						spawnPoints = spawnPoints.slice(center - 1, center + 1)
					}
					const entranceIndex = random.choose(spawnPoints)
					new Creep(renderTime, spawnData, entranceIndex, vertical, waveNumber)
				}
			}
		}
	}

	killCreep (renderTime, children) {
		this.creepCount -= children + 1
		if (this.creepCount === 0) {
			const waveTime = renderTime - this.waveStart
			// console.log('Wave complete!', this.count, waveTime)
			bridge.emit('wave complete', { wave: this.count, time: waveTime })
		}
	}

}
