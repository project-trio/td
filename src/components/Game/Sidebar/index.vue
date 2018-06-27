<template>
<div class="sidebar">
	<div class="stats">
		<div><span class="emoji">💰</span>{{ gold }}</div><div class="time"><span class="emoji">⏱</span>{{ displayTime }}</div>
	</div>
	<div v-for="(tower, idx) in $options.towers" class="tower-box" :key="tower.name">
		<button @click="onTower(tower.name)" class="selection tower-button capitalize" :class="{ selected: tower.name === build }">{{ idx + 1 }}</button>
	</div>
	<div v-for="player in players" class="player-box" :class="{ local: player.id === localId }" :key="player.id">
		<div>{{ player.name }}</div>
		<div>{{ player.lives }}</div>
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
		storeStateGame () {
			return this.$store.state.game
		},

		gold () {
			return this.storeStateGame.local.gold
		},

		secondsElapsed () {
			return Math.round(this.storeStateGame.renderTime / 1000)
		},
		displayTime () {
			let seconds = this.secondsElapsed
			if (seconds <= 0) {
				return seconds
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

		build () {
			return this.storeStateGame.build
		},

		localId () {
			return this.$store.state.signin.user.id
		},

		players () {
			return this.storeStateGame.players
		},
	},

	methods: {
		onTower (name) {
			this.storeStateGame.build = name
		},
	},
}
</script>

<style lang="stylus" scoped>
.stats
	text-align right
	height 36px
	margin 8px 0
	display flex
	justify-content flex-end
	align-items center
	font-size 18px
	font-variant-numeric tabular-nums

.time
	margin 0 14px

.emoji
	height 0
	margin-right -2px

.sidebar
	position fixed
	top 0
	left 0
	bottom 0
	width 256px
	background #2
	box-sizing border-box
	color #f

.tower-box
	width 25%
	padding 2px
	display inline-block
	box-sizing border-box

.tower-button
	font-size 20px
	width 100%

.selection
	border-radius 4px

.selection.selected
	background #dd6677

.player-box
	margin 8px
	padding 6px 8px
	background #0

.player-box.local
	background #212
</style>
