import storage from '@/xjs/storage'

const defaultGameState = () => {
	return {
		id: null,
		players: [],
		wave: 0,
		playing: false,
		missingUpdate: false,
		renderTime: 0,
		build: 'pellet',
		local: {
			lives: 20,
			gold: 80,
		},
	}
}

export default {
	state: {
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
			this.state.game.players[id].waves.push(waveNumber)
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
