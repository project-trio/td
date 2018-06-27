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

	signinToken (token) {
		this.state.signin.attempted = true
		this.state.signin.token = token
		storage.set('token', token)
	},

	reset () {
		this.state.game = defaultGameState()
	},
}
