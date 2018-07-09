<template>
<div class="popover hover-parent">
	<slot />
	<div class="popover-content hover-child text-small">
		<span v-if="help" v-html="help" />
		<slot v-else name="hover" />
	</div>
</div>
</template>

<script>
export default {
	props: {
		help: String,
	},
}
</script>

<style lang="stylus" scoped>
.popover
	position relative
	cursor help

.popover-content
	position absolute
	background #3
	box-shadow 0 1px 4px #0
	text-align left
	padding 4px 8px
	z-index 9001
	bottom 100%
</style>
