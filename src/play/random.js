const seedrandom = require('seedrandom')

let rng

const index = (count) => {
	return Math.floor(rng() * count)
}

export default {

	init (seed) {
		rng = seedrandom(seed)
	},

	truthy () {
		return Math.round(rng())
	},

	index,

	choose (items) {
		return items[index(items.length)]
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
