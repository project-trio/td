const utils = {
	TESTING: process.env.NODE !== 'production',
}

export default {
	install (Vue) {
		Vue.prototype.$util = utils
	},
}
