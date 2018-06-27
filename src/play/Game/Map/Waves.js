import Creep from '@/play/Game/entity/Unit/Creep'

import bridge from '@/xjs/bridge'
import random from '@/xjs/random'

const CREEP_TYPES = [
	{
		name: 'normal',
		count: 10,
		health: [ 20, 4 ],
		speed: 1,
		gold: 1,
		attackBit: 1,
	},
	{
		name: 'immune',
		count: 10,
		health: [ 21, 4.5 ],
		speed: 1,
		gold: 1,
		attackBit: 1,
	},
	{
		name: 'group',
		grouped: true,
		count: 6,
		health: [ 20, 5 ],
		speed: 1,
		gold: 1,
		attackBit: 1,
	},
	{
		name: 'fast',
		count: 10,
		health: [ 20, 0 ],
		speed: 1.25,
		gold: 1,
		attackBit: 1,
	},
	{
		name: 'dark',
		count: 6,
		health: [ 20, 0 ],
		speed: 1,
		gold: 1,
		attackBit: 1,
	},
	{
		name: 'spawn',
		count: 4,
		health: [ 20, 0 ],
		speed: 1,
		gold: 2,
		attackBit: 1,
	},
	{
		name: 'flying',
		count: 10,
		health: [ 20, 0 ],
		speed: 1,
		gold: 1,
		attackBit: 2,
	},
]

const CREEP_TYPE_COUNT = CREEP_TYPES.length

export default class Waves {

	constructor (spawnPoints) {
		Creep.init()
		this.spawning = []
		this.count = 0
		this.spawnPoints = spawnPoints
		this.waveStart = 0
		this.creepCount = 0
	}

	spawn (renderTime) {
		this.count += 1
		const waveIndex = this.count - 1
		let creepIndex = waveIndex % CREEP_TYPE_COUNT
		if (waveIndex < 20 && creepIndex === 4) {
			creepIndex = 0
		}
		const data = CREEP_TYPES[creepIndex]
		this.creepCount += data.count * 2
		this.waveStart = renderTime

		this.spawning.push({
			index: 0,
			startAt: renderTime,
			health: data.health[0],
			speed: data.speed,
			name: data.name,
			count: data.count,
			gold: data.gold,
			grouped: data.grouped,
			attackBit: data.attackBit,
			isBoss: waveIndex && waveIndex % (CREEP_TYPE_COUNT + 1) === 0,
		})
		console.log('Wave', this.count, data)
	}

	update (renderTime) {
		const waveNumber = this.count
		const spawning = this.spawning
		for (let sidx = spawning.length - 1; sidx >= 0; sidx -= 1) {
			const spawnData = spawning[sidx]
			if (renderTime >= spawnData.startAt + spawnData.index * (spawnData.grouped ? 100 : 1000)) {
				if (spawnData.index >= spawnData.count - 1) {
					spawning.splice(sidx, 1)
				} else {
					spawnData.index += 1
				}
				for (let vertical = 0; vertical < 2; vertical += 1) {
					const entranceIndex = random.choose(this.spawnPoints[vertical])
					new Creep(spawnData, entranceIndex, vertical, waveNumber)
				}
			}
		}

	}

	killCreep (renderTime) {
		this.creepCount -= 1
		if (this.creepCount === 0) {
			const waveTime = renderTime - this.waveStart
			// console.log('Wave complete!', this.count, waveTime)
			bridge.emit('wave complete', { wave: this.count, time: waveTime })
		}
	}

}
