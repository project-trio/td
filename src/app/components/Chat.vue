<template>
<div class="chat">
	<div ref="chatScroll" class="chat-log scrolls">
		<div v-for="(msg, index) in messages" :key="index" class="my-1">
			<span class="font-bold">{{ msg.from }}</span>&ensp;<span class="italic text-sm">({{ timeSince(msg.at) }})</span>: {{ msg.body }}
		</div>
	</div>
	<div class="fixed left-0 bottom-0 h-16 w-full">
		<input ref="chatInput" v-model.trim="draftMessage" class="wh-full text-2xl px-2 bg-transparent" placeholder="press enter to chat" :disabled="disableChat">
	</div>
</div>
</template>

<script>
import store from '@/app/store'

const KEY_ENTER = 13

export default {
	data () {
		return {
			draftMessage: '',
		}
	},

	computed: {
		now () {
			return store.state.minuteTime
		},

		messages () {
			return store.state.chatMessages
		},

		disableChat () {
			return !this.pressed
		},

		pressed () {
			return store.state.key.pressed
		},
	},

	watch: {
		messages () {
			this.$nextTick(() => {
				if (this.$refs.chatScroll) {
					this.$refs.chatScroll.scrollTop = this.$refs.chatScroll.scrollHeight
				}
			})
		},

		pressed (key) {
			if (key.code === KEY_ENTER) {
				this.$nextTick(() => {
					this.$refs.chatInput.focus()
				})

				if (this.draftMessage) {
					// Bridge.emit('chat', { all: true, body: this.draftMessage }, (response) => {
					// 	if (response.error) {
					// 		//TODO display throttle error
					// 		p('chat err', response)
					// 	} else {
					// 		this.draftMessage = ''
					// 	}
					// })
				}
			}
		},
	},

	created () {
		// store.state.chatMessages = []
	},

	methods: {
		timeSince (timestamp) {
			const diff = this.now - timestamp
			if (diff < 30) {
				return `just now`
			}
			let timeAmount = Math.round(diff / 60)
			let timeName
			if (timeAmount < 90) {
				timeName = 'm'
			} else {
				timeAmount = Math.round(diff / 60 / 60)
				timeName = 'h'
			}
			return `${timeAmount}${timeName} ago`
		},
	},
}
</script>

<style lang="postcss" scoped>
.chat-log {
	@apply fixed left-0 text-left m-1 p-1;
	width: 300px;
	bottom: 64px;
	max-height: 200px;
}
</style>
