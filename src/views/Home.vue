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

	created () {
		this.connect()
		bridge.on('reconnect', this.connect)

		bridge.on('queued', ([ name, queuing ]) => {
			const names = this.$store.state.queue.names
			const index = names.indexOf(name)
			const alreadyQueued = index !== -1
			if (alreadyQueued !== queuing) {
				if (queuing) {
					names.push(name)
				} else {
					names.splice(index, 1)
				}
			}
		})
	},

	beforeDestroy () {
		bridge.off('reconnect', this.connect)
		bridge.off('queued')
	},

	methods: {
		connect () {
			bridge.emit('lobby', true, ({ names, scores, users }) => {
				this.$store.state.queue.names = names
				this.$store.state.queue.scores = scores
				this.$store.state.queue.users = users
			})
		},
	},
}
</script>
