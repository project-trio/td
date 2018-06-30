<template>
<div class="page-home">
	<Queue />
	<Chat />
</div>
</template>

<script>
import bridge from '@/xjs/bridge'

import Chat from '@/components/Chat'
import Queue from '@/components/Queue'

export default {
	components: {
		Chat,
		Queue,
	},

	beforeCreate () {
		bridge.emit('lobby', true, (names) => {
			this.$store.state.queue.names = names
		})

		bridge.on('queue join', (name) => {
			this.$store.state.queue.names.push(name)
		})
		bridge.on('queue leave', (name) => {
			const names = this.$store.state.queue.names
			const index = names.indexOf(name)
			if (index !== -1) {
				names.splice(index, 1)
			}
		})

		bridge.on('joined game', (data) => {
			if (data.error) {
				window.alert('Unable to join game: ' + data.error)
			}
			const gid = data.gid
			this.$store.state.game.id = gid
			this.$router.push({ name: 'Game', params: { gid } })
		})
	},

	beforeDestroy () {
		bridge.off('queue join')
		bridge.off('queue leave')
	},
}
</script>
