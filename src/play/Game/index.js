import store from '@/xjs/store'
import random from '@/xjs/random'

import GameMap from '@/play/Game/Map'

import Bullet from '@/play/Game/entity/Bullet'
import Creep from '@/play/Game/entity/Unit/Creep'
import Tower from '@/play/Game/entity/Unit/Tower'

export default class Game {

	constructor (container, data) {
		this.id = data.gid
		random.init(this.id)

		this.container = container

		this.updateCount = 0
		this.updateQueue = {}

		this.renderedSinceUpdate = false
		this.ticksRendered = 0
		this.lastTickTime = 0
		this.tickOffsets = -4

		this.tickDuration = data.tickDuration
		this.updateDuration = data.updateDuration
		this.ticksPerUpdate = this.updateDuration / this.tickDuration

		this.finished = false
		this.serverUpdate = -1
		this.updatesUntilStart = data.updatesUntilStart

		this.started = true

		this.map = new GameMap(this.container)

		this.ticksRendered = -this.updatesUntilStart * this.ticksPerUpdate
		this.lastTickTime = performance.now()
	}

	// Update

	calculateTicksToRender (currentTime) {
		const tickOffsetTime = this.tickOffsets * this.ticksPerUpdate * this.tickDuration / 2
		return Math.floor((currentTime - this.lastTickTime - tickOffsetTime) / this.tickDuration)
	}

	performTicks (ticksToRender) {
		let renderTime
		let ticksRenderedForFrame = 0
		const maxTicksToRender = ticksToRender > 9 ? Math.min(1000, Math.pow(ticksToRender, 0.75)) : 1
		while (ticksToRender > 0) {
			renderTime = this.ticksRendered * this.tickDuration
			store.state.game.renderTime = renderTime

			if (this.ticksRendered % this.ticksPerUpdate === 0) {
				if (this.dequeueUpdate(renderTime)) {
					store.state.game.missingUpdate = false
				} else {
					this.tickOffsets += 1
					if (renderTime > 0 && ticksToRender > this.ticksPerUpdate) {
						store.state.game.missingUpdate = true
					}
					// console.log('Missing update', ticksToRender, tickOffsets)
					break
				}
			}
			if (renderTime > 0) {
				Bullet.update(renderTime, this.tickDuration, false)
				Creep.update(renderTime, this.tickDuration, false)
				Tower.update(renderTime, this.tickDuration, false)
				this.map.waves.update(renderTime)
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

		if (nextUpdate.length) {
			store.winWave(nextUpdate)
			this.map.waves.spawn(renderTime)
		}
		return true
	}

	// Play

	enqueueUpdate (update, actions) {
		if (update >= 9 && this.updatePanel) {
			if (update > 9) {
				this.updatePanel.end()
			}
			this.updatePanel.begin()
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

		this.map.spawn(0) //TODO renderTime?
	}

	// Setup

	destroy () {
		store.resetGameState()
		Creep.destroy()
		Tower.destroy()
	}

	end () {
		this.finished = true
		store.state.game.playing = false
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
