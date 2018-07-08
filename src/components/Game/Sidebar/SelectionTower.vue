<template>
<div class="tower-selection">
	<div class="header">
		<div class="icon" :style="{ 'background-image': `url(${url})` }" />
		<div>
			<div class="capitalize text-large">{{ name }} Tower</div>
			<div>Level {{ level + 1 }}</div>
		</div>
	</div>
	<div class="stats">
		<div class="stat-row">
			<button @click="onTower(false)" class="selection">Sell (+{{ total('cost') }}g)</button>
			<button @click="onTower(true)" class="selection" :disabled="!upgradeable">Up (-{{ nextCost }}g)</button>
		</div>
		<div class="stat-row">
			<div class="label">💥</div>
			<div>{{ total('damage') }}</div>
			<div v-if="nextDamage" :class="{ 'text-faint': !upgradeable }">{{ nextDamage > 0 ? '+' : null }}{{ nextDamage }}</div>
		</div>
		<div class="stat-row">
			<div class="label">🎯</div>
			<div>{{ total('range') }}</div>
			<div v-if="nextRange" :class="{ 'text-faint': !upgradeable }">{{ nextRange > 0 ? '+' : null }}{{ nextRange }}</div>
		</div>
		<div class="stat-row">
			<div class="label">⏩</div>
			<div>{{ total('speed') }}</div>
			<div v-if="nextSpeed" :class="{ 'text-faint': !upgradeable }">{{ nextSpeed > 0 ? '+' : null }}{{ nextSpeed }}</div>
		</div>
	</div>
</div>
</template>

<script>
import local from '@/play/local'

import towers from '@/play/data/towers'

export default {
	props: {
		name: String,
		level: Number,
	},

	computed: {
		gold () {
			return this.$store.state.game.local.gold
		},
		upgradeable () {
			return this.nextCost <= this.gold
		},

		url () {
			return require(`@/assets/icons/${this.name}.png`)
		},

		data () {
			return towers[this.name]
		},

		nextCost () {
			return this.next('cost')
		},
		nextDamage () {
			return this.next('damage')
		},
		nextRange () {
			return this.next('range')
		},
		nextSpeed () {
			return this.next('speed')
		},
	},

	methods: {
		total (key) {
			let result = 0
			const keyValues = this.data[key]
			for (let idx = 0; idx <= this.level; idx += 1) {
				result += keyValues[idx]
			}
			return result
		},

		next (key) {
			return this.data[key][this.level + 1]
		},

		onTower (up) {
			const selection = local.game.selection
			if (selection) {
				if (up) {
					selection.tower.upgrade()
				} else {
					selection.tower.sell()
				}
			}
		},
	},
}
</script>

<style lang="stylus" scoped>
.tower-selection
	margin 8px
.header, .stat-row
	display flex
	align-items center

.header
	margin-bottom 4px

.icon
	width 48px
	height 48px
	background-size contain
	border-radius 4px
	margin-right 8px

.text-large, .stat-row
	font-size 20px

.stat-row
	& > *
		width 48px
		box-sizing border-box
	& .label
		text-align right
		margin-left 8px
		padding-right 8px
	& button
		background #5
		border-radius 6px
		color #f
		width 50%
		height 32px
		font-size 14px
		&:first-child
			margin-right 4px
		&:disabled
			opacity 0.5
	</style>
