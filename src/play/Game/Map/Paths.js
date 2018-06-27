let TILES_WIDE, TILES_TALL, TILES_TOTAL
let ENTRANCE_SIZE, EX, EY

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

let errorPath

export default class Paths {

	constructor (tilesWide, tilesTall, entranceSize, ex, ey) {
		TILES_WIDE = tilesWide
		TILES_TALL = tilesTall
		ENTRANCE_SIZE = entranceSize
		TILES_TOTAL = TILES_WIDE * TILES_TALL
		EX = ex
		EY = ey
		this.blockCheck = [0, -1, -TILES_WIDE, 1]

		this.blocked = tileArray()
		this.move = [ tileArray(), tileArray() ]
		this.test = [ tileArray(), tileArray() ]
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
			this.blocked[idx] = isBlocked
			if (blockCol < TILES_WIDE) {
				blockCol += 1
			} else {
				blockRow += 1
				blockCol = 1
			}
		}
		this.update()
		this.apply()
	}

	toggleTower (cx, cy, blocking) {
		let index = cx + (TILES_TALL - cy) * TILES_WIDE
		for (const diff of this.blockCheck) {
			index += diff
			this.blocked[index] = blocking
		}
	}

	blockedSquare (cx, cy) {
		let index = cx + (TILES_TALL - cy) * TILES_WIDE
		for (const diff of this.blockCheck) {
			index += diff
			if (this.blocked[index]) {
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
			const resultPath = this.move[vertical]
			const testPath = this.test[vertical]
			for (let idx = testPath.length - 1; idx >= 0; idx -= 1) {
				const testMove = testPath[idx]
				if (testMove) {
					resultPath[idx] = [ testMove[0], testMove[1] ]
				}
			}
		}
	}

	find (vertical, additionalIndicies) {
		//TODO if test === false then include creep occupied squares
		// console.time('path ' + vertical)
		const path = this.test[vertical]
		const requiredIndecies = new Set(this.entrances[vertical])
		let positions = [ ...this.exits[vertical] ]
		if (additionalIndicies) {
			for (const additionalIndex of additionalIndicies) {
				requiredIndecies.add(additionalIndex)
			}
		}

		const searchedIndexes = new Set()
		const blocked = this.blocked
		for (let idx = 0; idx < TILES_TOTAL; idx += 1) {
			if (blocked[idx]) {
				searchedIndexes.add(idx)
			}
		}
		for (const position of positions) {
			searchedIndexes.add(position)
		}

		let firstSearch = true
		let foundPath = false
		while (positions.length) {
			const nextSearch = []
			let diagonal = false
			for (const indexDiffs of this.ordinals) {
				for (const position of positions) {
					const column = position % TILES_WIDE
					const edgeCheck = column === 0 ? -1 : (column === TILES_WIDE - 1 ? 1 : false)
					for (const diffs of indexDiffs) {
						const diffX = diffs[0], diffY = diffs[1]
						if (edgeCheck && diffX === edgeCheck) {
							continue
						}
						const change = diffX + diffY
						const newIndex = position + change
						if (newIndex <= 0 || newIndex >= TILES_TOTAL || searchedIndexes.has(newIndex)) {
							continue
						}
						if (diagonal && (blocked[position + diffX] || blocked[position + diffY])) {
							continue
						}
						if (requiredIndecies.delete(newIndex) && !requiredIndecies.size) {
							foundPath = true
						}
						path[newIndex] = [ Math.sign(-diffX), Math.sign(-diffY) ]
						nextSearch.push(newIndex)
						searchedIndexes.add(newIndex)
					}
				}
				if (firstSearch) {
					break
				}
				diagonal = !diagonal
			}
			if (!nextSearch.length) {
				break
			}
			firstSearch = false
			positions = nextSearch
		}
		// console.timeEnd('path ' + vertical)
		return !foundPath && path
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
