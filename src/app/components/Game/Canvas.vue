<template>
<canvas class="block" />
</template>

<script>
import local from '@/play/local'

import Renderer from '@/play/render/Renderer'

export default {
	mounted () {
		local.renderer = new Renderer(this.$el)
	},

	beforeDestroy () {
		local.renderer?.destroy()
		local.renderer = null
	},
}
</script>
