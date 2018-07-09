<template>
<div>
	<h2>Highscores</h2>
	<table>
		<tr><th>User</th><th>Score</th></tr>
		<tr v-for="score in scores" :class="{ highlight: score[0] === localId }" :key="score[0]">
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
		localId () {
			return this.$store.state.signin.user.id
		},

		scores () {
			return this.$store.state.queue.scores[this.mode]
		},
	},
}
</script>

<style lang="stylus" scoped>
table
	margin auto
	border-collapse collapse

th, td
	padding 2px 8px
	min-width 96px
	box-sizing border-box

.highlight
	background-color #fee
</style>
