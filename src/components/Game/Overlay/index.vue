<template>
<div class="game-overlay">
	<div v-if="over" clsas="overlay">
		<h1 v-if="finished">
			<span v-if="winners.length">{{ localWinner ? 'You' : winners.join(', ') }} won in <Time :duration="finalTime" />!</span>
			<span v-else>Game over</span>
		</h1>
		<h1 v-else>Waiting{{ players.length > 1 ? ' for others to finish' : '' }}...</h1>
		<p v-if="!lives">You let too many creeps escape. Keep an eye on your lives next time!</p>
		<button @click="onLeave" class="big">Leave</button>
	</div>
</div>
</template>

<script>
import Time from '@/components/Time'

export default {
	components: {
		Time,
	},

	computed: {
		over () {
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

	methods: {
		onLeave () {
			this.$router.push({ name: 'Home' })
		},
	},
}
</script>

<style lang="stylus" scoped>
.game-overlay
	position absolute
	width 100%
	height 100%
	display flex
	justify-content center
	align-items center
	pointer-events none

.game-overlay > div
	pointer-events all
	padding 8px 16px
	background rgba(#2, 0.9)
	color #e
</style>
