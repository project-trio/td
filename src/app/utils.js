const TESTING = process.env.NODE_ENV === 'development'

export default {

	TESTING,

	pluralize (amount, word) {
		return `${amount} ${word}${amount === 1 ? '' : 's'}`
	},

}
