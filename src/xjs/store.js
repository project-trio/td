import Vue from 'vue'

import local from '@/play/local'

import storage from '@/xjs/storage'

const defaultGameState = () => {
	return {
		id: null,
		players: [],
		wave: 0,
		waves: [],
		waveCreepCount: 0,
		playing: false,
		finished: false,
		finalTime: 0,
		missingUpdate: false,
		renderTime: 0,
		build: null,
		local: {
			lives: 20,
			livesChange: null,
			gold: 80,
		},
		highscore: 0,
		overlay: null,
		towers: [],
		selection: null,
	}
}

export default {
	state: {
		loading: 0,

		queue: {
			names: [],
			scores: {},
			users: {},
		},

		signin: {
			token: storage.get('token'),
			reconnect: null,
			user: null,
		},

		game: defaultGameState(),

		settings: {
			shadows: 2,
		},

		key: {
			lastPress: {
				name: null,
				code: null,
				modifier: null,
				released: false,
			},
			count: 0,
			pressed: {},
		},
	},

	winWave (waveNumber, playerIndicies) {
		const players = this.state.game.players
		for (const playerIndex of playerIndicies) {
			const player = players[playerIndex]
			Vue.set(player.waves, waveNumber - 1, true)
			player.wavesWon += 1
			this.updateScore(player)
		}
	},

	updateScore (player) {
		const score = player.lives > 0 ? -20 + player.lives + player.wavesWon * 10 : 0
		player.score = score
		if (score === 0) {
			let highscore = 0
			for (const p of this.state.game.players) {
				if (p.score > highscore) {
					highscore = p.score
				}
			}
			this.state.game.highscore = highscore
		} else if (score > this.state.game.highscore) {
			this.state.game.highscore = score
		}
	},

	loseLife () {
		const newLives = this.state.game.local.lives - 1
		if (newLives >= 0) {
			this.state.game.local.lives = newLives
			this.state.game.local.livesChange = newLives
			local.game.map.applyLives()
		}
	},

	signinToken (token) {
		this.state.signin.token = token
		storage.set('token', token)
	},

	resetGameState () {
		this.state.game = defaultGameState()
	},

	changeGold (diff) {
		this.state.game.local.gold += diff
		local.game.map.applyGold()
	},
}
