<template>
<canvas />
</template>

<script>
import Renderer from '@/play/render/Renderer'
import Loop from '@/play/render/Loop'
import Game from '@/play/Game'

import bridge from '@/xjs/bridge'

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

	beforeCreate () {
		bridge.on('server update', (data) => {
			const game = this.$options.game
			if (game && !game.finished) {
				const update = data.update
				if (game.serverUpdate !== update - 1) {
					console.error('Invalid update', game.serverUpdate, update)
				}
				game.enqueueUpdate(update, data.actions)
				bridge.emit('updated', { update })
			}
		})
	},

	mounted () {
		const renderer = new Renderer(this.$el)
		this.$options.renderer = renderer
		if (this.gameData) {
			this.createGame()
		}
	},

	beforeDestroy () {
		bridge.off('server update')
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
