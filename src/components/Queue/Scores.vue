<template>
<div>
	<h2>Highscores</h2>
	<table>
		<tr><th>Rank</th><th>User</th><th>Score</th></tr>
		<tr v-for="(score, idx) in scores" :class="{ highlight: score[0] === localId }" :key="score[0]">
			<td>{{ idx + 1 }}</td><td><User :id="score[0]" :size="32" /></td><td><Time :duration="score[1]" /></td>
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
		mode: {
			type: String,
			required: true,
		},
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

<style lang="postcss" scoped>
table {
	margin: auto;
	border-collapse: collapse;
	min-width: 288px;
}
th, td {
	padding: 2px 8px;
	box-sizing: border-box;
}

.highlight {
	background-color: #fee;
}
</style>
