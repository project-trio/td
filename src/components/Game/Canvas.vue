<template>
<canvas />
</template>

<script>
import Renderer from '@/play/render/Renderer'
import Game from '@/play/Game'

import bridge from '@/xjs/bridge'
import local from '@/xjs/local'

export default {
	props: {
		gameData: Object,
	},

	renderer: null,

	watch: {
		gameData () {
			this.createGame()
		},
	},

	beforeCreate () {
		bridge.on('server update', (data) => {
			const game = local.game
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
		if (local.game) {
			local.game.destroy()
			local.game = null
		}
	},

	methods: {
		createGame () {
			local.game = new Game(this.$options.renderer, this.gameData)
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
