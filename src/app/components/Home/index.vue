<template>
<div class="page-home">
	<Queue />
	<Chat />
</div>
</template>

<script>
import store from '@/app/store'

import bridge from '@/helpers/bridge'

import local from '@/play/local'

import Chat from '@/app/components/Chat'
import Queue from '@/app/components/Queue'

export default {
	components: {
		Chat,
		Queue,
	},

	created () {
		if (local.gid) {
			bridge.emit('leave game', local.gid)
			local.gid = null
		}
		local.setGame(null)

		this.connect()
		bridge.on('reconnect', this.connect)

		bridge.on('queued', ([ name, queuing ]) => {
			const names = store.state.queue.names
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
				store.state.queue.names = names
				store.state.queue.scores = scores
				store.state.queue.users = users
			})
		},
	},
}
</script>
