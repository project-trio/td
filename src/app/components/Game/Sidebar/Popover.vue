<template>
<div class="popover  relative cursor-help group">
	<slot />
	<div class="popover-content  bg-black rounded-sm absolute text-left px-2 py-1 invisible group-hover:visible text-sm z-50">
		<span v-if="help">{{ help }}</span>
		<slot v-else name="hover" />
	</div>
</div>
</template>

<script>
export default {
	props: {
		help: {
			type: String,
			default: undefined,
		},
	},
}
</script>

<style lang="postcss" scoped>
.popover-content {
	box-shadow: 0 1px 4px #000;
	bottom: 100%;
}
</style>
