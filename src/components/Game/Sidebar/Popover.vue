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
		help: {
			type: String,
			default: undefined,
		},
	},
}
</script>

<style lang="postcss" scoped>
.popover {
	position: relative;
	cursor: help;
}

.popover-content {
	position: absolute;
	background: #333;
	box-shadow: 0 1px 4px #000;
	text-align: left;
	padding: 4px 8px;
	z-index: 9001;
	bottom: 100%;
}
</style>
