const TESTING = process.env.NODE_ENV === 'development'

export default {

	TESTING,

	HOST_URL: TESTING ? 'http://192.168.0.11:8031' : 'https://trio.suzu.online',

	pluralize (amount, word) {
		return `${amount} ${word}${amount === 1 ? '' : 's'}`
	},

}
