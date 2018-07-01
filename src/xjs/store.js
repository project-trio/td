import storage from '@/xjs/storage'

const defaultGameState = () => {
	return {
		id: null,
		players: [],
		wave: 0,
		waveCreepCount: 0,
		playing: false,
		finished: false,
		missingUpdate: false,
		renderTime: 0,
		build: 'pellet',
		local: {
			lives: 20,
			livesChange: null,
			gold: 80,
		},
	}
}

export default {
	state: {
		loading: 0,

		queue: {
			names: [],
		},

		signin: {
			token: storage.get('token'),
			reconnect: null,
			user: null,
			attempted: false,
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

	winWave (playerIds) {
		const waveNumber = this.state.game.wave
		for (const id of playerIds) {
			this.state.game.players[id].waves[waveNumber - 1] = true
		}
	},

	loseLife () {
		const newLives = this.state.game.local.lives - 1
		if (newLives >= 0) {
			this.state.game.local.lives = newLives
			this.state.game.local.livesChange = newLives
			if (newLives === 0) {
				// bridge.emit('died') //TODO
				this.state.game.finished = true
				this.state.game.playing = false
			}
		}
	},

	signinToken (token) {
		this.state.signin.attempted = true
		this.state.signin.token = token
		storage.set('token', token)
	},

	resetGameState () {
		this.state.game = defaultGameState()
	},
}
