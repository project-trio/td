<template>
<div class="sidebar  w-64 h-full text-white  flex flex-col justify-between">
	<div class="flex flex-col">
		<div class="stats  my-2 h-8 text-right text-lg  flex justify-end items-center">
			<div class="local-display"><span>❤️</span>{{ lives }}</div>
			<div class="local-display"><span>💰</span>{{ gold }}</div>
			<div class="time"><span class="emoji">⏱</span><Time :duration="renderTime" /></div>
		</div>
		<div class="towers">
			<div v-for="(tower, idx) in $options.towers" :key="tower.name" class="tower-box  inline-block w-1/4">
				<button v-if="availableTower(idx)"
					class="tower-button selection  relative w-full font-bold capitalize bg-contain bg-center" :class="{ selected: tower.name === build }" :style="{ 'background-image': `url(${url(tower)})` }"
					@click="setTowerName(tower.name)"
				>
					<span class="absolute top-0 left-0 text-sm ml-1 text-gray-700">{{ idx + 1 }}</span>
				</button>
			</div>
		</div>
		<transition-group name="players" tag="div" class="players-container  overflow-y-scroll">
			<PlayerBox v-for="player in players" :key="player.id" :player="player" :local="player.id === localId" :waveCreeps="waveCreeps" :winner="finished && player.score > highscore" />
		</transition-group>
	</div>
	<div>
		<div v-if="selection">
			<SelectionTower :name="selection.name" :level="selection.level" :boost="selection.boost" />
		</div>
		<transition-group name="waves" tag="div" class="waves-container  text-faint  flex">
			<WaveBox v-for="wave in waves" :key="wave[0]" :number="wave[0]" :name="wave[1]" :boss="wave[2]" />
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

		lives () {
			return this.storeStateGame.local.lives
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

<style lang="postcss" scoped>
.sidebar {
	background: #222;
}

.stats {
	font-variant-numeric: tabular-nums;
	& > div {
		margin-right: 14px;
	}
}

@media (min-height: 767px) {
	.local-display {
		display: none;
	}
}

.emoji {
	margin-right: -4px;
}

.tower-box {
	padding: 2px;
}
.tower-button {
	@apply w-full rounded;
	&.selected {
		@apply opacity-50;
		transform: scale(0.9);
		box-shadow: 0px 0px 8px 2px #000;
	}
}

.players-container {
	flex-shrink: 10;
	min-height: 32px;
}

.players-move {
	transition: transform 500ms ease-out;
}

@media (min-height: 896px) {
	.waves-container {
		@apply absolute bottom-0 z-10;
		left: 50%;
		margin-left: -24px;
	}
}

.waves-enter {
	@apply opacity-0;
}
.waves-leave-to {
	@apply opacity-0;
	transform: translateX(-51.2px);
}
.waves-leave-active {
	@apply absolute;
}
.wave-box {
	@apply h-16;
	width: 51.2px;
	transition: all 800ms;
}
</style>
