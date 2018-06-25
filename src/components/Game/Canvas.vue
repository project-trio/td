<template>
<canvas />
</template>

<script>
import Renderer from '@/play/render/Renderer'
import Loop from '@/play/render/Loop'
import Game from '@/play/Game'

export default {
	props: {
		gameData: Object,
	},

	renderer: null,
	game: null,
	loop: null,

	watch: {
		gameData () {
			this.createGame()
		},
	},

	mounted () {
		const renderer = new Renderer(this.$el)
		this.$options.renderer = renderer
		if (this.gameData) {
			this.createGame()
		}
	},

	beforeDestroy () {
		this.$options.renderer.renderer = null
		this.$options.renderer = null
		this.$options.game = null
		if (this.$options.loop) {
			this.$options.loop.game = null
			this.$options.loop = null
		}
	},

	methods: {
		createGame () {
			this.$options.game = new Game(this.$options.renderer.container, this.gameData)
			this.$options.game.renderer = this.$options.renderer
			this.$options.loop = new Loop(this.$options.game)
		},
	},
}
</script>

<style lang="stylus" scoped>
canvas
	display block
	width 100%
	height 100%
</style>
