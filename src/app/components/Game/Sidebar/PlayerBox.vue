<template>
<div class="player-box  relative m-2" :class="{ local, winner }">
	<div class="progress-bar  bg-brand-900 absolute top-0 left-0 bottom-0" :style="{ width: wavePercent+'%' }" />
	<div class="relative z-10">
		<div class="flex justify-between"><div>{{ player.name }}</div><div>{{ player.lives }}</div></div>
		<div class="waves  mt-1  flex flex-wrap">
			<div v-for="(won, idx) in player.waves" :key="idx" :class="{ won }" />
		</div>
	</div>
</div>
</template>

<script>
export default {
	props: {
		player: {
			type: Object,
			required: true,
		},
		waveCreeps: {
			type: Number,
			required: true,
		},
		local: {
			type: Boolean,
			required: true,
		},
		winner: {
			type: Boolean,
			required: true,
		},
	},

	computed: {
		wavePercent () {
			return (this.waveCreeps - this.player.creeps) / this.waveCreeps * 100
		},
	},
}
</script>

<style lang="postcss" scoped>
.player-box {
	padding: 6px 8px;
	background: #000;
	&.local {
		background: #212;
	}
	&.winner {
		@apply bg-brand-500;
	}
}

.player-box.winner .progress-bar {
	display: none !important;
}

.waves {
	margin-right: -2px;
	margin-bottom: -2px;
	& > * {
		@apply bg-gray-700;
		margin-right: 2px;
		margin-bottom: 2px;
		width: 7px;
		height: 4px;
		&.won {
			@apply bg-warning-500;
		}
	}
}
</style>
