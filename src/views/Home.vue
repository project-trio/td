<template>
<div class="page-home">
	<Queue />
	<Chat />
</div>
</template>

<script>
import Chat from '@/components/Chat'
import Queue from '@/components/Queue'

import bridge from '@/xjs/bridge'

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
	},

	beforeDestroy () {
		this.setReadyTimer(false)

		bridge.off('queue join')
		bridge.off('queue leave')
	},
}
</script>
