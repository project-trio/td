<template>
<canvas />
</template>

<script>
import Renderer from '@/play/render/Renderer'

export default {
	mounted () {
		this.renderer = new Renderer(this.$el)
	},
}
</script>

<style lang="stylus" scoped>
canvas
	display block
	width 100%
	height 100%
</style>
