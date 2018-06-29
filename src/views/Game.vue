<template>
<div class="page-game">
	<div v-if="loading">
		Loading... {{ loading }}
	</div>
	<div v-else>
		<Sidebar />
		<GameCanvas :gameData="gameData" />
	</div>
</div>
</template>

<script>
import bridge from '@/xjs/bridge'
import local from '@/xjs/local'
import store from '@/xjs/store'

import GameCanvas from '@/components/Game/Canvas'
import Sidebar from '@/components/Game/Sidebar'

export default {
	components: {
		GameCanvas,
		Sidebar,
	},

	props: {
		gid: String,
	},

	data () {
		return {
			gameData: null,
		}
	},

	computed: {
		loading () {
			return this.$store.state.loading
		},

		joined () {
			return this.$store.state.game.id === this.gid
		},
	},

	beforeCreate () {
		bridge.on('start game', (data) => {
			console.log('start game', data)
			const players = data.players
			const localId = this.$store.state.signin.user
			for (let idx = players.length - 1; idx >= 0; idx -= 1) {
				const player = players[idx]
				player.score = 0
				player.lives = 20
				player.waves = new Array(data.waves)
				player.creeps = 0
				player.towers = []
				// player.creepsTotal = 0 //TODO?
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
		bridge.off('start game')
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
