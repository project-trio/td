<template>
<div class="sidebar">
	<div class="stats">
		<div><span class="emoji">💰</span>{{ gold }}</div><div class="time"><span class="emoji">⏱</span><Time :duration="renderTime" /></div>
	</div>
	<div v-for="(tower, idx) in $options.towers" class="tower-box" :key="tower.name">
		<button @click="onTower(tower.name)" class="selection tower-button capitalize" :class="{ selected: tower.name === build }" :style="{ background: color(tower) }">{{ idx + 1 }}</button>
	</div>
	<transition-group name="players" tag="div" class="players-container">
		<PlayerBox v-for="player in players" :player="player" :local="player.id === localId" :waveCreeps="waveCreeps" :key="player.id" :winner="finished && player.score > highscore" />
	</transition-group>
</div>
</template>

<script>
import towers from '@/play/data/towers'
import PlayerBox from '@/components/Game/Sidebar/PlayerBox'

import Time from '@/components/Time'

export default {
	components: {
		PlayerBox,
		Time,
	},

	towers: towers.names.map(name => {
		const tower = towers[name]
		tower.name = name
		return tower
	}),

	computed: {
		storeStateGame () {
			return this.$store.state.game
		},

		waveCreeps () {
			return this.storeStateGame.waveCreepCount
		},

		gold () {
			return this.storeStateGame.local.gold
		},

		finished () {
			return this.storeStateGame.finished
		},

		renderTime () {
			return this.storeStateGame.renderTime
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

		highscore () {
			return this.storeStateGame.highscore
		},
	},

	methods: {
		onTower (name) {
			this.storeStateGame.build = name
		},

		color (tower) {
			let hexColor = tower.color
			if (hexColor === 0x0 || hexColor === 0x222222) {
				hexColor += 0x444444
			}
			let color = hexColor.toString(16)
			while (color.length < 6) {
				color = `0${color}`
			}
			return `#${color}`
		},
	},
}
</script>

<style lang="stylus" scoped>
.sidebar
	width 256px
	background #2
	color #f

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

.tower-box
	width 25%
	padding 2px
	display inline-block
	box-sizing border-box

.tower-button
	font-size 20px
	width 100%
	color #0
	font-weight bold

.selection
	border-radius 4px

.selection.selected
	transform scale(0.89)
	border 1px solid #9
	box-shadow 0px 0px 8px 2px #f

.players-container
	display flex
	flex-direction column
</style>
