<template>
<Popover class="wave-box capitalize" :style="{ 'background-image': `url(${require(`@/assets/icons/${name}.png`)})` }">
	{{ number }}
	<template slot="hover">{{ name }} {{ boss ? 'Boss' : null }}</template>
</Popover>
</template>

<script>
import Popover from '@/components/Game/Sidebar/Popover'

export default {
	components: {
		Popover,
	},

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
</style>
