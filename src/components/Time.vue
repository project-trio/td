<template>
<time>
	{{ displayTime }}
</time>
</template>

<script>
export default {
	props: {
		duration: Number,
	},

	computed: {
		displayTime () {
			let seconds = Math.floor(this.duration / 1000)
			if (seconds <= 0) {
				return -seconds
			}
			let minutes
			if (seconds >= 60) {
				minutes = Math.floor(seconds / 60)
				seconds %= 60
				if (minutes < 10) {
					minutes = `0${minutes}`
				}
			} else {
				minutes = '00'
			}
			if (seconds < 10) {
				seconds = `0${seconds}`
			}
			return `${minutes}:${seconds}`
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
