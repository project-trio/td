const seedrandom = require('seedrandom')

let rng

export default {

	init (seed) {
		rng = seedrandom(seed)
	},

	choose (items) {
		return items[Math.floor(rng() * items.length)]
	},

}
