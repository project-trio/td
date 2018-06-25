<template>
<div class="page-game">
	<GameCanvas v-if="gameData" :gameData="gameData" />
</div>
</template>

<script>
import bridge from '@/xjs/bridge'

import GameCanvas from '@/components/Game/Canvas'

export default {
	components: {
		GameCanvas,
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
