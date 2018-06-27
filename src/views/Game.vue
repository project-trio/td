<template>
<div class="page-game">
	<Sidebar />
	<GameCanvas :gameData="gameData" />
</div>
</template>

<script>
import bridge from '@/xjs/bridge'
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
		joined () {
			return this.$store.state.game.id === this.gid
		},
	},

	beforeCreate () {
		bridge.on('start game', (data) => {
			console.log('start game', data)
			const players = data.players
			for (const player of players) {
				player.score = 0
				player.lives = 20
				player.wavesWon = 0
				player.creepsTotal = 0
				player.creepsAlive = 0
			}
			store.state.game.players = data.players
			this.gameData = data
		})
	},

	beforeDestroy () {
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
