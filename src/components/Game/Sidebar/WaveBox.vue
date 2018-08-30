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
		number: {
			type: Number,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		boss: {
			type: Boolean,
			required: true,
		},
	},
}
</script>

<style lang="postcss" scoped>
.wave-box {
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	display: flex;
	align-items: flex-end;
	padding-left: 8px;
	padding-bottom: 2px;
	box-sizing: border-box;
	position: relative;
}
</style>
