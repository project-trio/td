export default {

	TESTING: window.location.protocol === 'http:',

	pluralize (amount, word) {
		return `${amount} ${word}${amount === 1 ? '' : 's'}`
	},

}
