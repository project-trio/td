<template>
<div class="h-full  flex">
	<Sidebar />
	<div v-if="loading">
		Loading... {{ loading }}
	</div>
	<div v-else class="relative">
		<GameOverlay />
		<GameCanvas />
	</div>
</div>
</template>

<script>
import store from '@/app/store'

import bridge from '@/helpers/bridge'

import local from '@/play/local'
import Game from '@/play/Game'

import GameCanvas from '@/app/components/Game/Canvas'
import GameOverlay from '@/app/components/Game/Overlay'
import Sidebar from '@/app/components/Game/Sidebar'

export default {
	components: {
		GameCanvas,
		GameOverlay,
		Sidebar,
	},

	props: {
		gid: {
			type: String,
			required: true,
		},
	},

	computed: {
		loading () {
			return store.state.loading
		},

		joined () {
			return store.state.game.id === this.gid
		},
	},

	beforeCreate () {
		bridge.on('started game', (data) => {
			// console.log('started game', data)
			const players = data.players
			for (let idx = players.length - 1; idx >= 0; idx -= 1) {
				const player = players[idx]
				player.score = 0
				player.lives = 20
				player.waves = new Array(data.waves)
				player.wavesWon = 0
				player.creeps = 0
				player.towers = []
			}
			store.state.game.players = data.players
			local.setGame(new Game(data))
		})

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

	beforeDestroy () {
		bridge.off('started game')
		bridge.off('server update')
	},

	mounted () {
		if (this.joined) {
			bridge.emit('ready', this.gid)
		} else {
			bridge.emit('join game', this.gid, (data) => {
				if (data.error) {
					console.log('rejoin error', data.error)
					this.$router.replace({ name: 'Home' })
				} else {
					console.log('rejoined', data)
					local.setGame(new Game(data))
				}
			})
		}
	},
}
</script>
