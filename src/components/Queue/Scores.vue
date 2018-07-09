<template>
<div>
	<h2>Highscores</h2>
	<table>
		<tr><th>User</th><th>Score</th></tr>
		<tr v-for="score in scores" :key="score[0]">
			<td><User :id="score[0]" :size="32" /></td><td><Time :duration="score[1] * 1000" /></td>
		</tr>
	</table>
</div>
</template>

<script>
import Time from '@/components/Time'
import User from '@/components/User'

export default {
	components: {
		Time,
		User,
	},

	props: {
		mode: String,
	},

	computed: {
		scores () {
			return this.$store.state.queue.scores[this.mode]
		},
	},
}
</script>

<style lang="stylus" scoped>
table
	margin auto
	border-spacing 8px 0

th
	min-width 80px
</style>
