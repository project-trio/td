const DIAGONAL_DISTANCE = Math.sqrt(2)

let TILES_WIDE, TILES_TALL, TILES_TOTAL
let ENTRANCE_SIZE, EX, EY

let errorPath

const tileArray = () => {
	return new Array(TILES_TOTAL)
}

const entrance = (enter, vertical) => {
	const result = []
	let tx = vertical ? (TILES_WIDE - ENTRANCE_SIZE) / 2 : (enter ? 1 : TILES_WIDE)
	let ty = vertical ? (enter ? 1 : TILES_TALL) : (TILES_TALL - ENTRANCE_SIZE) / 2
	if (vertical) {
		tx += EX
	} else {
		ty += EY
	}
	for (let eidx = 0; eidx < ENTRANCE_SIZE; eidx += 1) {
		if (vertical) {
			tx += 1
		} else {
			ty += 1
		}
		result[eidx] = (tx - 1) + (ty - 1) * TILES_WIDE
	}
	return result
}

export default class Paths {

	constructor (tilesWide, tilesTall, entranceSize, ex, ey) {
		TILES_WIDE = tilesWide
		TILES_TALL = tilesTall
		ENTRANCE_SIZE = entranceSize
		TILES_TOTAL = TILES_WIDE * TILES_TALL
		EX = ex
		EY = ey
		this.blockCheck = [ 0, -1, -TILES_WIDE, 1 ]

		this.moves = [ tileArray(), tileArray() ]
		this.tests = [ tileArray(), tileArray() ]
		this.entrances = [ entrance(true, 0), entrance(true, 1) ]
		this.exits = [ entrance(false, 0), entrance(false, 1) ]
		this.ordinals = [
			[ [1, 0], [0, -TILES_WIDE], [-1, 0], [0, TILES_WIDE] ],
			[ [1, -TILES_WIDE], [-1, -TILES_WIDE], [-1, TILES_WIDE], [1, TILES_WIDE] ],
		]

		let blockCol = 1, blockRow = 1
		for (let idx = 0; idx < TILES_TOTAL; idx += 1) {
			let isBlocked = false
			if (blockCol === 1 || blockCol === TILES_WIDE) {
				const entranceStart = (TILES_TALL - entranceSize) / 2 + ey
				if (blockRow <= entranceStart || blockRow > entranceStart + entranceSize) {
					isBlocked = true
				}
			} else if (blockRow === 1 || blockRow === TILES_TALL) {
				const entranceStart = (TILES_WIDE - entranceSize) / 2 + ex
				if (blockCol <= entranceStart || blockCol > entranceStart + entranceSize) {
					isBlocked = true
				}
			}
			this.block(idx, isBlocked)

			if (blockCol < TILES_WIDE) {
				blockCol += 1
			} else {
				blockRow += 1
				blockCol = 1
			}
		}
		for (let vertical = 0; vertical < 2; vertical += 1) {
			for (const index of this.exits[vertical]) {
				this.tests[vertical][index] = 0
			}
		}

		this.update()
		this.apply()
	}

	block (index, blocking) {
		this.tests[0][index] = blocking ? 0 : null
		this.tests[1][index] = blocking ? 0 : null
	}
	toggleTower (cx, cy, blocking) {
		let index = cx + (TILES_TALL - cy) * TILES_WIDE
		for (const diff of this.blockCheck) {
			index += diff
			this.block(index, blocking)
		}
	}

	blockedSquare (cx, cy) {
		const testPath = this.tests[0]
		let index = cx + (TILES_TALL - cy) * TILES_WIDE
		for (const diff of this.blockCheck) {
			index += diff
			if (testPath[index] === 0) {
				return true
			}
		}
		return false
	}

	update (allCreeps) {
		errorPath = null
		const additionalIndicies = allCreeps ? [] : null
		if (additionalIndicies) {
			for (const { currentIndex } of allCreeps) {
				if (currentIndex) {
					additionalIndicies.push(currentIndex)
				}
			}
		}
		for (let vertical = 0; vertical < 2; vertical += 1) {
			const error = this.find(vertical, additionalIndicies)
			if (error) {
				errorPath = error
			}
		}
		return errorPath === null
	}

	apply () {
		if (errorPath) {
			console.error('Unable to calculate required path')
			this.debugPath(errorPath, false)
			return false
		}
		for (let vertical = 0; vertical < 2; vertical += 1) {
			const resultPath = this.moves[vertical]
			const testPath = this.tests[vertical]
			for (let idx = testPath.length - 1; idx >= 0; idx -= 1) {
				resultPath[idx] = testPath[idx] || null
			}
			// if (!vertical) { //SAMPLE
			// 	this.debugPath(resultPath, true)
			// }
		}
	}

	find (vertical, additionalIndicies) {
		// console.time('path ' + vertical)
		const testPath = this.tests[vertical]
		const requiredIndecies = new Set(this.entrances[vertical])
		if (additionalIndicies) {
			for (const additionalIndex of additionalIndicies) {
				requiredIndecies.add(additionalIndex)
			}
		}
		let positions = [ ...this.exits[vertical] ]
		for (let idx = 0; idx < TILES_TOTAL; idx += 1) {
			if (testPath[idx] !== 0) {
				testPath[idx] = null
			}
		}

		let cardinalsOnly = true
		let reachedAllRequiredIndicies = false
		while (positions.length) {
			const nextSearch = []
			let diagonal = false
			for (const indexDiffs of this.ordinals) {
				for (const position of positions) {
					const column = position % TILES_WIDE
					const edgeCheck = column === 0 ? -1 : (column === TILES_WIDE - 1 ? 1 : false)
					const fromPosition = testPath[position]
					const distance = fromPosition ? fromPosition[2] : 0
					const newDistance = distance + (diagonal ? DIAGONAL_DISTANCE : 1)
					for (const diffs of indexDiffs) {
						const diffX = diffs[0], diffY = diffs[1]
						if (edgeCheck && diffX === edgeCheck) {
							continue
						}
						const newIndex = position + diffX + diffY
						if (newIndex <= 0 || newIndex >= TILES_TOTAL) {
							continue
						}
						const checkPosition = testPath[newIndex]
						if (checkPosition === 0) {
							continue
						}
						if (checkPosition !== null && checkPosition[2] - newDistance < 0.01) {
							continue
						}
						if (diagonal && (testPath[position + diffX] === 0 || testPath[position + diffY] === 0)) {
							continue
						}
						if (!reachedAllRequiredIndicies && requiredIndecies.delete(newIndex) && !requiredIndecies.size) {
							reachedAllRequiredIndicies = true
						}
						testPath[newIndex] = [ Math.sign(-diffX), Math.sign(-diffY), newDistance ]
						nextSearch.push(newIndex)
					}
				}
				if (cardinalsOnly) {
					cardinalsOnly = false
					break
				}
				diagonal = true
			}
			if (!nextSearch.length) {
				break
			}
			positions = nextSearch
		}
		// console.timeEnd('path ' + vertical)
		return !reachedAllRequiredIndicies && testPath
	}

	debugPath (path, entrance) {
		const ARROWS = {
			'10': '→',
			'1-1': '↗',
			'0-1': '↑',
			'-1-1': '↖',
			'-10': '←',
			'-11': '↙',
			'01': '↓',
			'11': '↘',
		}
		let count = 0, out = '%c'
		for (let idx = 0; idx < TILES_TOTAL; idx += 1) {
			const pi = path[idx]
			out += (pi ? ARROWS[`${pi[0]}${pi[1]}`] : '·') + ' '
			if (count >= TILES_WIDE - 1) {
				count = 0
				out += '\n'
			} else {
				count += 1
			}
		}
		console.log(out, `color:${entrance ? 'black' : 'red'};`)
	}

}
