import render from '@/play/render'

const TILE_SIZE = 16
const TILES_WIDE = 10
const TILES_TALL = 10
const MAP_WIDTH = TILE_SIZE * TILES_WIDE
const MAP_HEIGHT = TILE_SIZE * TILES_TALL

export default class GameMap {

	constructor (parent) {
		this.container = render.group(parent)
		this.container.interactive = true

		const ground = render.rectangle(MAP_WIDTH, MAP_HEIGHT, { color: 0x448866, parent: this.container })
		ground.owner = ground

		ground.onHover = () => {
		}
		ground.onMove = (_point) => {
		}
		ground.onBlur = () => {
		}

		ground.onClick = (_point, _rightClick) => {
			return true
		}
	}

}
