<template>
<div id="app">
	<div v-if="reconnectAttempts !== null" class="overlay">
		<h1>{{ reconnectAttempts }} attempts to reconnect</h1>
	</div>
	<router-view/>
</div>
</template>

<script>
export default {
	computed: {
		reconnectAttempts () {
			return this.$store.state.signin.reconnect
		},
	},

	created () {
		window.addEventListener('contextmenu', this.onRightClick, true)
	},

	beforeDestroy () {
		window.addEventListener('contextmenu', this.onRightClick, true)
	},

	methods: {
		onRightClick (event) {
			event.preventDefault()
		},
	},
}
</script>

<style lang="stylus">
body
	margin 0

#app
	font-family -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif
	-webkit-font-smoothing antialiased
	-moz-osx-font-smoothing grayscale
	color #2

.overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	z-index 9001
	background rgba(#f, 0.5)
	color #e33
	display flex
	justify-content center
	align-items center

//INPUT

input, button
	border none
	outline none

button
	transition-property background, transform, opacity, border, box-shadow
	transition-duration 300ms

.big, .selection
	cursor pointer
	height 56px
	width 224px
	font-size 24px
	background #e8
	&:not(.selected):hover
		opacity 0.7
		&:active
			opacity 0.4

.selection.selected
	cursor default

.big
	display block
	margin auto
	border-radius 4px

//TEXT

.capitalize
	text-transform capitalize

.text-small
	font-size 0.9em

.text-faint
	color #9

.text-center
	text-align center
</style>
