<template>
<div class="sidebar">
	<div v-for="tower in $options.towers" class="tower-box" :key="tower.name">
		<button class="big tower-button capitalize">{{ tower.name }}</button>
	</div>
	<div v-for="player in players" class="player-box" :class="{ local: player.id === localId }" :key="player.id">
		<div>{{ player.name }}</div>
		<div>{{ player.score }}</div>
	</div>
</div>
</template>

<script>
import towers from '@/play/data/towers'

export default {
	towers: towers.names.map(name => {
		const tower = towers[name]
		tower.name = name
		return tower
	}),

	computed: {
		localId () {
			return this.$store.state.signin.user.id
		},

		players () {
			return this.$store.state.game.players
		},
	},
}
</script>

<style lang="stylus" scoped>
.sidebar
	position fixed
	top 0
	left 0
	bottom 0
	width 256px
	background #2
	padding-top 64px
	box-sizing border-box
	color #f

.tower-box
	width 25%
	padding 2px
	display inline-block
	box-sizing border-box

.tower-button
	font-size 16px
	width 100%

.player-box
	margin 8px
	padding 6px 8px
	background #0

.player-box.local
	background #212
</style>
