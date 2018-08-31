<template>
<Popover class="wave-box  relative pl-2 pb-px bg-contain bg-center bg-no-repeat capitalize  flex items-end" :style="{ 'background-image': `url(${require(`@/assets/icons/${name}.png`)})` }">
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
