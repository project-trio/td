<template>
<div class="player-box" :class="{ local }">
	<div class="progress-bar" :style="{ width: wavePercent+'%' }" />
	<div class="box-contents">
		<div class="flex-ends"><div>{{ player.name }}</div><div>{{ player.lives }}</div></div>
		<div class="waves">
			<div v-for="(won, idx) in player.waves" class="wave-box" :class="{ won }" :key="idx" />
		</div>
	</div>
</div>
</template>

<script>
export default {
	props: {
		player: Object,
		waveCreeps: Number,
		local: Boolean,
	},

	computed: {
		wavePercent () {
			return (this.waveCreeps - this.player.creeps) / this.waveCreeps * 100
		},
	},
}
</script>

<style lang="stylus" scoped>
.player-box
	margin 8px
	padding 6px 8px
	background #0
	position relative
	&.local
		background #212

.progress-bar
	position absolute
	top 0
	left 0
	bottom 0
	background #226

.box-contents
	position relative
	z-index 1

.waves
	display flex
	flex-wrap wrap
	margin-top 4px
	margin-right -2px
	margin-bottom -2px

.wave-box
	margin-right 2px
	margin-bottom 2px
	width 7px
	height 4px
	background #6
	&.won
		background #ca4

.flex-ends
	display flex
	justify-content space-between
</style>
