<template>
<canvas />
</template>

<script>
import Renderer from '@/play/render/Renderer'
import Game from '@/play/Game'

export default {
	props: {
		gameData: Object,
	},

	mounted () {
		const renderer = new Renderer(this.$el)
		this.$options.renderer = renderer
		this.$options.game = new Game(renderer.floorContainer, this.gameData)
	},
}
</script>

<style lang="stylus" scoped>
canvas
	display block
	width 100%
	height 100%
</style>
