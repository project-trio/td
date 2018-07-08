<template>
<div class="wave-box hover-parent" :style="{ 'background-image': `url(${require(`@/assets/icons/${name}.png`)})` }">
	{{ number }}
	<span class="popover hover-child capitalize">{{ name }} {{ boss ? 'Boss' : null }}</span>
</div>
</template>

<script>
export default {
	props: {
		number: Number,
		name: String,
		boss: Boolean,
	},
}
</script>

<style lang="stylus" scoped>
.wave-box
	background-size contain
	background-position center
	background-repeat no-repeat
	display flex
	align-items flex-end
	padding-left 8px
	padding-bottom 2px
	box-sizing border-box
	position relative

.popover
	position absolute
	width 128px
	top -16px
	z-index 9001
</style>
