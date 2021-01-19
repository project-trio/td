import bridge from '@/helpers/bridge'
import store from '@/app/store'

import local from '@/play/local'
import random from '@/play/random'

import Bullet from '@/play/entity/Bullet'
import Creep from '@/play/entity/Unit/Creep'
import Tower from '@/play/entity/Unit/Tower'

import GameMap from '@/play/Game/Map'
import Waves from '@/play/Game/Waves'

export default class Game {

	constructor (data) {
		local.gid = data.gid
		this.id = data.gid
		random.init(this.id)

		this.updateCount = 0
		this.updateQueue = {}
		this.lastUpdate = false

		this.renderedSinceUpdate = false
		this.ticksRendered = 0
		this.lastTickTime = 0
		this.tickOffsets = -4

		this.tickDuration = data.tickDuration
		this.updateDuration = data.updateDuration
		this.ticksPerUpdate = this.updateDuration / this.tickDuration

		this.serverUpdate = -1
		this.updatesUntilStart = data.updatesUntilStart
		this.mode = data.mode
		if (data.mode === 'random') {
			this.creepMode = 'random'
			this.towerMode = 'random'
		} else if (data.mode === 'spawns') {
			this.creepMode = 'spawns'
		}
		if (this.towerMode === 'random') {
			const towers = []
			towers.push(random.truthy() ? 1 : 2)
			towers.push(random.truthy() ? 3 : 6)
			towers.push(random.truthy() ? 4 : 7)
			towers.push(random.truthy() ? 5 : 8)
			store.state.game.towers = towers
		} else {
			store.state.game.towers = null
		}

		this.map = new GameMap()
		this.waves = new Waves(this.map.paths.entrances, data.waves, this.creepMode)

		if (local.renderer) {
			local.renderer.container.add(this.map.container)
		}

		this.ticksRendered = -this.updatesUntilStart * this.ticksPerUpdate
		this.lastTickTime = performance.now()
	}

	// Update

	calculateTicksToRender (currentTime) {
		const tickOffsetTime = this.tickOffsets * this.ticksPerUpdate * this.tickDuration / 2
		return Math.floor((currentTime - this.lastTickTime - tickOffsetTime) / this.tickDuration)
	}

	performTicks (ticksToRender, playing) {
		const gameState = store.state.game
		let renderTime
		let ticksRenderedForFrame = 0
		const maxTicksToRender = ticksToRender > 9 ? Math.min(1000, Math.pow(ticksToRender, 0.75)) : 1
		while (ticksToRender > 0) {
			renderTime = this.ticksRendered * this.tickDuration
			gameState.renderTime = renderTime

			const ticksFromUpdate = this.ticksRendered % this.ticksPerUpdate
			if (ticksFromUpdate === 0) {
				if (this.dequeueUpdate(renderTime)) {
					gameState.missingUpdate = false
				} else {
					this.tickOffsets += 1
					if (renderTime > 0 && ticksToRender > this.ticksPerUpdate) {
						gameState.missingUpdate = true
					}
					// console.log('Missing update', ticksToRender, tickOffsets)
					break
				}
			}
			if (playing && renderTime > 0) {
				Bullet.update(renderTime, this.tickDuration, false)
				Creep.update(renderTime, this.tickDuration, false)
				Tower.update(renderTime, this.tickDuration, false)
				this.waves.update(renderTime)

				if (ticksFromUpdate === Math.floor(this.ticksPerUpdate / 2)) {
					const data = { creeps: this.waves.creepCount }
					const livesChange = gameState.local.livesChange
					if (livesChange !== null) {
						data.lives = livesChange
						gameState.local.livesChange = null
						if (livesChange <= 0) {
							gameState.playing = false
						}
					}
					if (local.syncTowers.length) {
						data.towers = local.syncTowers
						local.syncTowers = []
					}
					bridge.emit('player update', data)
				}
			} else if (renderTime === 0) {
				this.startPlaying()
			}

			this.ticksRendered += 1
			ticksToRender -= 1
			this.lastTickTime += this.tickDuration

			if (ticksRenderedForFrame >= maxTicksToRender) {
				break
			}
			ticksRenderedForFrame += 1
		}
		if (ticksToRender === 0) {
			this.renderedSinceUpdate = true
		}
		return true
	}

	dequeueUpdate (renderTime) {
		const nextUpdate = this.updateQueue[this.updateCount]
		if (!nextUpdate) {
			return false
		}
		this.updateQueue[this.updateCount] = null
		this.updateCount += 1

		const nextWave = nextUpdate[0]
		if (nextWave) {
			const winners = nextUpdate[1]
			if (winners) {
				store.winWave(nextWave, winners)
			} else {
				this.waves.spawn(renderTime)
			}
		}
		if (this.lastUpdate) {
			this.finish()
		}
		return true
	}

	// Play

	enqueueUpdate (update, actions, finalTime) {
		if (finalTime) {
			store.state.game.finalTime = finalTime
			this.lastUpdate = true
		}
		this.serverUpdate = update
		this.updateQueue[update] = actions
		if (this.renderedSinceUpdate) {
			const behindUpdates = update - this.updateCount
			if (behindUpdates > 0) {
				this.tickOffsets -= behindUpdates
				this.renderedSinceUpdate = false
				console.log('Catching up to server update', behindUpdates, this.tickOffsets)
			}
		}
	}

	startPlaying () {
		if (store.state.game.playing) {
			console.error('game already playing')
			return
		}
		store.state.game.playing = true

		this.waves.spawn(0)
		//SAMPLE
		// for (let i = 0; i < 7; i += 1) {
		// 	const delay = i * 800
		// 	window.setTimeout(() => {
		// 		this.waves.spawn(delay)
		// 	}, delay)
		// }
	}

	finish () {
		store.state.game.finished = true
		store.state.game.playing = false
	}

	// Setup

	destroy () {
		Bullet.destroy()
		Creep.destroy()
		Tower.destroy()
	}

	updatePlayer (gameData) {
		const pid = gameData.pid
		const player = store.state.game.players[pid]
		if (!player) {
			console.error('Updated player DNE', player, gameData, store.state.game.players)
			return
		}
		player.isActive = gameData.joined
		store.state.chatMessages.push({ name: player.name, active: player.isActive })
	}

}
