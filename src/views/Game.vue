<template>
<GameContainer :gid="gid" />
</template>

<script>
import GameContainer from '@/components/Game'

export default {
	components: {
		GameContainer,
	},

	props: {
		gid: {
			type: String,
			required: true,
		},
	},
}
</script>
