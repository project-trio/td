const PI = Math.PI
const PIt2 = PI * 2

export default {

	between (x1, y1, x2, y2) {
		const diffX = x2 - x1
		const diffY = y2 - y1
		return diffX * diffX + diffY * diffY
	},

	checkRadius (value) {
		return value * value * 4
	},

	betweenRadians (a, b) {
		const diff = ((b - a + PI) % PIt2) - PI
		return diff < -PI ? diff + PIt2 : diff
	},

}
