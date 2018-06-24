import storage from '@/xjs/storage'

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

		game: {
			id: null,
			players: [],
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

	setGame (data) {
		this.state.game.id = data.gid
		this.state.game.players = data.players
	},
}
