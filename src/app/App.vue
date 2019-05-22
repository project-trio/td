<template>
<div id="app">
	<div v-if="reconnectAttempts !== null" class="overlay reconnect">
		<h1>{{ reconnectAttempts }} attempts to reconnect</h1>
	</div>
	<router-view />
</div>
</template>

<script>
export default {
	computed: {
		reconnectAttempts () {
			return this.$store.state.signin.reconnect
		},
	},

	created () {
		window.addEventListener('contextmenu', this.onRightClick, true)
	},

	beforeDestroy () {
		window.addEventListener('contextmenu', this.onRightClick, true)
	},

	methods: {
		onRightClick (event) {
			event.preventDefault()
		},
	},
}
</script>

<style lang="postcss">
@import '../assets/styles/tailwind.css';

html, body, #app {
	@apply h-full;
}

#app {
	@apply font-sans text-black antialiased;
}

.overlay {
	@apply text-gray-400 absolute inset-0 z-40  flex justify-center items-center;
}
.reconnect {
	background: rgba(131, 75, 75, 0.5);
}

a {
	@apply no-underline text-brand-500;
	transition: color 300ms ease-out;
	&:hover {
		@apply text-brand-200;
		&:active {
			@apply text-brand-600;
		}
	}
}

h1 {
	@apply text-4xl;
}
h2 {
	@apply text-3xl;
}

.text-faint {
	@apply text-gray-600;
}

/* BUTTONS */

input, button {
	outline: 0 !important;
}
button {
	@apply text-gray-800;
	transition-property: background, transform, opacity, border, box-shadow;
	transition-duration: 300ms;
	&:disabled {
		@apply cursor-not-allowed opacity-50;
	}
}

.big, .selection {
	@apply text-xl bg-gray-400;
	height: 56px;
	width: 224px;
	&:not(.selected):hover {
		opacity: 0.7;
		&:active {
			opacity: 0.4;
		}
	}
}
.selection.selected {
	@apply cursor-default;
}
.big {
	@apply block m-auto rounded;
}
</style>
