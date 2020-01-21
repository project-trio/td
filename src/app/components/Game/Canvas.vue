<template>
<canvas class="block" />
</template>

<script>
import bridge from '@/helpers/bridge'
import store from '@/app/store'

import Game from '@/play/Game'
import local from '@/play/local'

import Renderer from '@/play/render/Renderer'

export default {
	props: {
		gameData: {
			type: Object,
			default: undefined,
		},
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
			const gameState = store.state.game
			if (game) {
				const update = data.update
				if (game.serverUpdate !== update - 1) {
					console.error('Invalid update', game.serverUpdate, update)
				}
				const players = gameState.players
				for (let pidx = players.length - 1; pidx >= 0; pidx -= 1) {
					const player = players[pidx]
					const state = data.states[pidx]
					if (state.lives !== undefined) {
						player.lives = state.lives
						store.updateScore(player)
					}
					player.creeps = state.creeps
					if (state.towers) {
						player.towers = state.towers
					}
				}
				game.enqueueUpdate(update, data.actions, data.finished)
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
