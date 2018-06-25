<template>
<div class="chat">
	<div ref="chatScroll" class="chat-log scrolls">
		<div v-for="(msg, index) in messages" class="msg" :key="index">
			<span class="msg-from">{{ msg.from }}</span>&ensp;<span class="msg-at">({{ timeSince(msg.at) }})</span>: {{ msg.body }}
		</div>
	</div>
	<div class="chat-input-container">
		<input ref="chatInput" v-model.trim="draftMessage" class="chat-input" placeholder="press enter to chat" :disabled="disableChat">
	</div>
</div>
</template>

<script>
import store from '@/xjs/store'

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

<style lang="stylus" scoped>
.chat-log
	text-align left
	margin 4px
	padding 4px
	width 300px
	position fixed
	left 0
	bottom 64px
	max-height 200px
	z-index 0

.msg
	margin 4px 0
.msg-from
	font-weight 500
.msg-at
	font-style italic
	font-size 0.75em

.chat-input-container
	position fixed
	left 0
	right 0
	bottom 0
	height 64px
	width 100%
.chat-input
	height inherit
	width inherit
	font-size 1.5em
	padding 0 8px
	background transparent
</style>
