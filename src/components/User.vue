<template>
<div class="flex items-center">
	<div class="bg-cover bg-no-repeat rounded-sm" :style="{ 'background-image': `url(${avatarUrl})`, width: `${size}px`, height: `${size}px` }" />
	<a :href="userUrl" class="ml-1" target="_blank">{{ user.name }}</a>
</div>
</template>

<script>
import util from '@/xjs/util'

export default {
	props: {
		id: {
			type: Number,
			required: true,
		},
		size: {
			type: Number,
			required: true,
		},
	},

	computed: {
		user () {
			return this.$store.state.queue.users[this.id]
		},

		userUrl () {
			return `${util.HOST_URL}/user/${this.user.name}`
		},

		avatarUrl () {
			const pixelSize = this.size * window.devicePixelRatio
			const smallSize = pixelSize <= 48
			if (this.user.ccid) {
				return `http://storage.cloud.casualcollective.com/avatars/${Math.ceil(this.user.ccid / 5000)}/${this.user.ccid}${smallSize ? 't' : ''}.jpg`
			}
			const fallback = `http://storage.cloud.casualcollective.com/avatars/avatar_${smallSize ? 'small' : 'large'}.png`
			if (this.user.md5) {
				return `https://www.gravatar.com/avatar/${this.user.md5}?s=${pixelSize}&d=${encodeURIComponent(fallback)}`
			}
			return fallback
		},
	},
}
</script>
