const TESTING = process.env.NODE_ENV === 'development'

export default {

	TESTING,

	HOST_URL: TESTING ? 'http://localhost:8031' : 'https://trio.suzu.online',

	pluralize (amount, word) {
		return `${amount} ${word}${amount === 1 ? '' : 's'}`
	},

}
