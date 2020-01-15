<template>
<div class="game-overlay overlay">
	<div v-if="gameOver">
		<h1 v-if="finished" class="text-center">
			<span v-if="winners.length">{{ localWinner ? 'You' : winners.join(', ') }} won in <Time :duration="finalTime" />!</span>
			<span v-else>Game over</span>
		</h1>
		<h1 v-else>Waiting{{ players.length > 1 ? ' for others to finish' : '' }}...</h1>
		<p v-if="!lives">You let too many creeps escape. Keep an eye on your lives next time!</p>
		<button class="selection" @click="onLeave">Leave</button>
	</div>
	<div v-else-if="overlay === 'help'">
		<h1 class="text-center">TD Guide</h1>
		<p>Build a maze to corral the creeps:</p>
		<table>
			<tr><th>Action</th><th>Hotkey</th><th>Mouse</th></tr>
			<tr><td>Build</td><td>1 – 8</td><td>Left click map</td></tr>
			<tr><td>Upgrade</td><td>U</td><td>Right click</td></tr>
			<tr><td>Sell</td><td>S</td><td>Middle click</td></tr>
			<tr><td>Snap</td><td>F</td><td>Double left click</td></tr>
		</table>
		<p>Earn points by being the first to clear each wave of creeps. Lose points by losing lives. The race is on!</p>
		<button class="selection" @click="onClose">Done</button>
	</div>
</div>
</template>

<script>
import storage from '@/xjs/storage'

import Time from '@/components/Time'

export default {
	components: {
		Time,
	},

	computed: {
		overlay () {
			return this.$store.state.game.overlay
		},

		gameOver () {
			return this.finished || this.lives <= 0
		},

		finished () {
			return this.$store.state.game.finished
		},

		finalTime () {
			return this.$store.state.game.finalTime
		},

		lives () {
			return this.$store.state.game.local.lives
		},

		localWinner () {
			return this.winners.length === 1 && this.winners[0] === this.$store.state.signin.user.name
		},

		players () {
			return this.$store.state.game.players
		},

		winners () {
			const highscore = this.highscore
			if (highscore <= 0) {
				return []
			}
			return this.players.filter(p => p.score === highscore).map(p => p.name)
		},

		highscore () {
			return this.$store.state.game.highscore
		},
	},

	created () {
		if (!storage.get('helped')) {
			this.$store.state.game.overlay = 'help'
			storage.set('helped', 1)
		}
	},

	methods: {
		onLeave () {
			this.$router.push({ name: 'Home' })
		},

		onClose () {
			this.$store.state.game.overlay = null
		},
	},
}
</script>

<style lang="postcss" scoped>
.game-overlay {
	@apply pointer-events-none;
	& > div {
		@apply w-full px-8 m-4;
		background: rgba(34,34,34,0.9);
		max-width: 480px;
	}
}

button {
	@apply pointer-events-auto my-4;
}

h1 {
	@apply my-4;
}

table {
	@apply w-full;
	border-spacing: 0 4px;
	& th {
		@apply text-left;
	}
}
</style>
