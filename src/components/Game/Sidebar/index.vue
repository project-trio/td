<template>
<div class="sidebar flex-column">
	<div class="flex-column">
		<div class="stats">
			<div><span class="emoji">💰</span>{{ gold }}</div><div class="time"><span class="emoji">⏱</span><Time :duration="renderTime" /></div>
		</div>
		<div class="towers">
			<div v-for="(tower, idx) in $options.towers" class="tower-box" :key="tower.name">
				<button v-if="availableTower(idx)" @click="setTowerName(tower.name)" class="selection tower-button capitalize" :class="{ selected: tower.name === build }" :style="{ 'background-image': `url(${url(tower)})` }">
					<span class="button-hotkey">{{ idx + 1 }}</span>
				</button>
			</div>
		</div>
		<transition-group name="players" tag="div" class="players-container">
			<PlayerBox v-for="player in players" :player="player" :local="player.id === localId" :waveCreeps="waveCreeps" :key="player.id" :winner="finished && player.score > highscore" />
		</transition-group>
	</div>
	<div>
		<div v-if="selection">
			<SelectionTower :name="selection.name" :level="selection.level" />
		</div>
		<transition-group name="waves" tag="div" class="waves-container text-faint">
			<WaveBox v-for="wave in waves" :number="wave[0]" :name="wave[1]" :boss="wave[2]" :key="wave[0]" />
		</transition-group>
	</div>
</div>
</template>

<script>
import local from '@/play/local'

import creeps from '@/play/data/creeps'
import towers from '@/play/data/towers'

import PlayerBox from '@/components/Game/Sidebar/PlayerBox'
import WaveBox from '@/components/Game/Sidebar/WaveBox'
import SelectionTower from '@/components/Game/Sidebar/SelectionTower'

import Time from '@/components/Time'

export default {
	components: {
		PlayerBox,
		SelectionTower,
		Time,
		WaveBox,
	},

	towers: towers.names.map(name => {
		const tower = towers[name]
		tower.name = name
		return tower
	}),

	computed: {
		availableTowers () {
			return this.$store.state.game.towers
		},

		storeStateGame () {
			return this.$store.state.game
		},

		waveCreeps () {
			return this.storeStateGame.waveCreepCount
		},

		gold () {
			return Math.floor(this.storeStateGame.local.gold)
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
			const result = Array.apply(null, this.storeStateGame.players)
			return result.sort((a, b) => b.score - a.score)
		},

		highscore () {
			return this.storeStateGame.highscore
		},

		selection () {
			return this.storeStateGame.selection
		},

		waves () {
			const result = []
			const startWave = this.storeStateGame.wave
			for (let idx = 0; idx < 6; idx += 1) {
				const waveIndex = startWave + idx
				const wave = this.storeStateGame.waves[waveIndex]
				if (!wave) {
					break
				}
				result.push([ waveIndex + 1, creeps[wave[0]].name, wave[1] ])
			}
			return result
		},
	},

	watch: {
		availableTowers () {
			const towerIndex = this.availableTower(0) ? 0 : 1
			this.setTowerName(this.$options.towers[towerIndex].name)
		},
	},

	mounted () {
		window.addEventListener('keydown', this.keydown)
	},

	beforeDestroy () {
		window.removeEventListener('keydown', this.keydown)
	},

	methods: {
		availableTower (index) {
			return !this.availableTowers || this.availableTowers.includes(index + 1)
		},

		keydown (event) {
			if (event.repeat) {
				return false
			}
			const keyCode = event.which || event.keyCode
			if (keyCode >= 49 && keyCode <= 56) {
				const towerIndex = keyCode - 49
				if (this.availableTower(towerIndex)) {
					const tower = this.$options.towers[towerIndex]
					this.setTowerName(tower.name)
				}
			} else {
				const selection = local.game.selection
				if (selection) {
					if (keyCode === 83) {
						selection.tower.sell()
					} else if (keyCode === 85) {
						selection.tower.upgrade()
					} else if (keyCode === 70) {
						selection.tower.detonate()
					}
				}
			}
		},

		setTowerName (name) {
			this.storeStateGame.build = name
			const game = local.game
			if (game) {
				game.map.setTowerName(name)
			}
		},

		onTower (name) {
			this.setTowerName(name)
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

		url (tower) {
			return require(`@/assets/icons/${tower.name}.png`)
		},
	},
}
</script>

<style lang="stylus" scoped>
.sidebar
	width 256px
	height inherit
	background #2
	color #f
	justify-content space-between

.flex-column
	display flex
	flex-direction column

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
	background-size contain
	background-position center
	position relative

.button-hotkey
	position absolute
	left 3px
	top 0
	font-size 14px
	color #6

.players-container
	flex-shrink 10
	min-height 32px
	overflow-y scroll

.selection
	border-radius 4px

.selection.selected
	transform scale(0.9)
	opacity 0.5
	box-shadow 0px 0px 8px 2px #0

.players-move
	transition transform 500ms ease-out

.waves-container
	display flex
	width 320px

.waves-leave-to
	transform translateX(-51.2px)
.waves-leave-active
	position absolute

.wave-box
	width 51.2px
	height 64px
	transition all 800ms
</style>
