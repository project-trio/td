<template>
<div class="sidebar">
	<div v-for="tower in $options.towers" class="tower-container" :key="tower.name">
		<button class="big tower-button capitalize">{{ tower.name }}</button>
	</div>
</div>
</template>

<script>
import towers from '@/play/data/towers'

export default {
	towers: towers.names.map(name => {
		const tower = towers[name]
		tower.name = name
		return tower
	}),
}
</script>

<style lang="stylus" scoped>
.sidebar
	position fixed
	top 0
	left 0
	bottom 0
	width 256px
	background #2
	padding-top 64px
	box-sizing border-box
	color #f

.tower-container
	width 25%
	padding 2px
	display inline-block
	box-sizing border-box

.tower-button
	font-size 16px
	width 100%
</style>
