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
		this.state.signin.token = token
		storage.set('token', token)
	},
}
