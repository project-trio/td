<template>
<div id="app">
	<router-view/>
</div>
</template>

<script>
export default {
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

//INPUT

input, button
	border none
	outline none

button
	transition background, opacity 300ms

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
</style>
