const seedrandom = require('seedrandom')

let rng

export default {

	init (seed) {
		rng = seedrandom(seed)
	},

	choose (items) {
		return items[Math.floor(rng() * items.length)]
	},

	shuffle (array) {
		let j, tmp
		for (let i = array.length - 1; i > 0; i--) {
			j = Math.floor(rng() * (i + 1))
			tmp = array[i]
			array[i] = array[j]
			array[j] = tmp
		}
		return array
	},

}
