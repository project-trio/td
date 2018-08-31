<template>
<div class="m-2">
	<div class="header">
		<div class="wh-12 bg-contain rounded mr-2" :style="{ 'background-image': `url(${url})` }" />
		<div>
			<div class="capitalize text-xl">{{ name }} Tower</div>
			<div>
				<span>Level {{ level + 1 }}</span>
				<span class="text-faint"> ・ </span>
				<span v-if="isBoost" class="text-faint">
					Damageless
				</span>
				<span v-else>
					<span v-if="air"><span class="air">Air </span><span v-if="!ground">only</span><span v-else>+ </span></span>
					<span v-if="ground"><span class="ground">Ground</span><span v-if="!air"> only</span></span>
				</span>
			</div>
		</div>
	</div>
	<div class="description  mt-1 mb-2">{{ data.description }}</div>
	<div class="stats">
		<div>
			<button @click="onTower(false)" class="selection mr-1">Sell (+{{ total('cost') }}g)</button>
			<button @click="onTower(true)" class="selection" :disabled="!upgradeable">Up (-{{ nextCost }}g)</button>
		</div>
		<div>
			<Popover help="Attack damage">💥</Popover>
			<div>{{ total('damage') }}{{ isBoost ? '%' : null }}</div>
			<div v-if="nextDamage" :class="{ 'text-faint': !upgradeable }">{{ nextDamage > 0 ? '+' : null }}{{ nextDamage }}{{ isBoost ? '%' : null }}</div>
			<div v-if="boost" class="boost">+{{ boost }}%</div>
		</div>
		<div>
			<Popover help="Attack range">🎯</Popover>
			<div>{{ total('range') }}</div>
			<div v-if="nextRange" :class="{ 'text-faint': !upgradeable }">{{ nextRange > 0 ? '+' : null }}{{ nextRange }}</div>
		</div>
		<div v-if="data.radius">
			<Popover help="Splash damage radius">💦</Popover>
			<div>{{ total('radius') }}</div>
			<div v-if="nextRadius" :class="{ 'text-faint': !upgradeable }">+{{ nextRadius }}</div>
		</div>
		<div>
			<Popover help="Attacks per second">⏩</Popover>
			<div>{{ total('speed') }}</div>
			<div v-if="nextSpeed" :class="{ 'text-faint': !upgradeable }">{{ nextSpeed > 0 ? '+' : null }}{{ nextSpeed }}</div>
		</div>
		<div v-if="data.slow">
			<Popover help="Slows creep movement">❄️</Popover>
			<div>{{ total('slow') }}%</div>
			<div v-if="nextSlow" :class="{ 'text-faint': !upgradeable }">+{{ nextSlow }}%</div>
		</div>
		<div v-if="data.stun">
			<Popover help="Stuns">⚡️</Popover>
			<div>{{ total('stun') }}s</div>
			<div v-if="nextStun" :class="{ 'text-faint': !upgradeable }">+{{ nextStun }}s</div>
		</div>
	</div>
</div>
</template>

<script>
import local from '@/play/local'

import towers from '@/play/data/towers'

import Popover from '@/components/Game/Sidebar/Popover'

export default {
	components: {
		Popover,
	},

	props: {
		name: {
			type: String,
			required: true,
		},
		level: {
			type: Number,
			required: true,
		},
		boost: {
			type: Number,
			required: true,
		},
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

		isBoost () {
			return !this.data.attackBit
		},
		air () {
			return this.data.attackBit & 2
		},
		ground () {
			return this.data.attackBit & 1
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
		nextRadius () {
			return this.next('radius')
		},
		nextSpeed () {
			return this.next('speed')
		},
		nextSlow () {
			return this.next('slow')
		},
		nextStun () {
			return this.next('stun')
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

<style lang="postcss" scoped>
.header, .stats > * {
	@apply flex items-center;
}

.stats > * {
	@apply text-xl;
	& button {
		@apply w-1/2 rounded-lg text-sm h-8 text-white bg-grey-darker;
	}
	& > * {
		@apply w-12;
	}
	& .popover {
		@apply text-right ml-2 pr-2;
	}
}

@media (max-height: 480px) {
	.stats > *:nth-child(n+2) {
		@apply hidden;
	}
}
@media (max-height: 544px) {
	.description {
		@apply hidden;
	}
}

.boost {
	color: #ff3;
}
.air {
	color: #9af;
}
.ground {
	color: #ca7;
}
</style>
