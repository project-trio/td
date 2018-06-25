const utils = {
	TESTING: process.env.NODE !== 'production',

	pluralize (amount, word) {
		return `${amount} ${word}${amount === 1 ? '' : 's'}`
	},
}

export default {
	install (Vue) {
		Vue.prototype.$util = utils
	},
}
