<template>
<time>
	{{ displayTime }}
</time>
</template>

<script>
export default {
	props: {
		duration: {
			type: Number,
			required: true,
		},
	},

	computed: {
		displayTime () {
			let seconds = Math.floor(this.duration / 1000)
			if (seconds <= 0) {
				return -seconds
			}
			let minutes
			if (seconds >= 60) {
				minutes = Math.floor(seconds / 60)
				seconds %= 60
				if (minutes < 10) {
					minutes = `0${minutes}`
				}
			} else {
				minutes = '00'
			}
			if (seconds < 10) {
				seconds = `0${seconds}`
			}
			return `${minutes}:${seconds}`
		},
	},
}
</script>
