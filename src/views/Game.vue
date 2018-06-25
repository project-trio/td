<template>
<div class="page-game">
	<GameCanvas />
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

	computed: {
		joined () {
			return this.$store.state.game.id === this.gid
		},
	},

	created () {
		if (!this.joined) {
			console.log('rejoin', this.gid)
			bridge.emit('join game', this.gid, (data) => {
				console.log('joined', data)
				this.$store.setGame(data)
			})
		}
	},

	mounted () {
		if (this.joined) {
			console.log('ready up')
			bridge.emit('ready', this.gid, (data) => {
				console.log(data)
			})
		}
	},
}
</script>
