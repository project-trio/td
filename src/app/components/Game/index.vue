<template>
<div class="h-full  flex">
	<Sidebar />
	<div v-if="loading">
		Loading... {{ loading }}
	</div>
	<div v-else class="relative">
		<GameOverlay />
		<GameCanvas :gameData="gameData" />
	</div>
</div>
</template>

<script>
import store from '@/app/store'

import bridge from '@/helpers/bridge'

import local from '@/play/local'

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

	data () {
		return {
			gameData: undefined,
		}
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
			console.log('started game', data)
			const players = data.players
			const localId = store.state.signin.user
			for (let idx = players.length - 1; idx >= 0; idx -= 1) {
				const player = players[idx]
				player.score = 0
				player.lives = 20
				player.waves = new Array(data.waves)
				player.wavesWon = 0
				player.creeps = 0
				player.towers = []
				if (player.id === localId) {
					local.playerIndex = idx
				}
			}
			store.state.game.players = data.players
			this.gameData = data
		})
	},

	beforeDestroy () {
		if (this.gid) {
			bridge.emit('leave game', this.gid)
		}
		bridge.off('started game')
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
					this.gameData = data
				}
			})
		}
	},
}
</script>
