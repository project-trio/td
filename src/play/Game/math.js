export default {

	pointDistance (x1, y1, x2, y2) {
		const diffX = x2 - x1
		const diffY = y2 - y1
		return diffX * diffX + diffY * diffY
	},

	withinSquared (distance, range) {
		return distance < (range * range)
	},

	checkRadius (value) {
		return value * value * 4
	},

}
