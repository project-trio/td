<template>
<div class="mt-4">
	<h2>Highscores</h2>
	<table>
		<tr><th>Rank</th><th>User</th><th>Score</th></tr>
		<tr v-for="(score, idx) in scores" :key="score[0]" :class="{ 'bg-brand-100': score[0] === localId }">
			<td>{{ idx + 1 }}</td><td><User :id="score[0]" :size="32" /></td><td><Time :duration="score[1]" /></td>
		</tr>
	</table>
</div>
</template>

<script>
import store from '@/app/store'

import Time from '@/app/components/Time'
import User from '@/app/components/User'

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
			return store.state.signin.user.id
		},

		scores () {
			return store.state.queue.scores[this.mode]
		},
	},
}
</script>

<style lang="postcss" scoped>
table {
	@apply m-auto border-collapse;
	min-width: 288px;
	& th, & td {
		@apply px-2 py-1;
	}
}
</style>
