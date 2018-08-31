<template>
<div class="text-center">
	<h1 class="my-8">{{ queueCount }} in queue</h1>
	<div class="mb-4">
		<button @click="onMultiplayer(false)" class="selection" :class="{ selected: !multiplayer }">Single player</button>
		<button @click="onMultiplayer(true)" class="selection" :class="{ selected: multiplayer }">Multiplayer</button>
	</div>

	<div v-if="multiplayer" class="multiplayer">
		<p class="mode-description">Compete against other players to clear the creeps the fastest!</p>
		<div class="queue-action">
			<div v-if="enoughPlayersForGame">
				<button @click="onReady" class="ready-button big" :class="{ selected: readyRequested }" :disabled="readyRemaining < 2">Ready{{ readyRequested ? '!' : `?` }} ({{ readyRemaining }})</button>
			</div>
			<p v-else class="text-faint m-12">
				No one else is in queue for a game yet. Why not send the link to a friend?
			</p>
			<p>Vote for a mode to play:</p>
		</div>
	</div>
	<div v-else>
		<p class="mode-description">Take on the creeps in solo training and improve your high score.</p>
	</div>

	<div>
		<button v-for="mode in $options.arcadeModes" @click="onMode(mode)" class="selection capitalize" :class="{ selected: gameMode === mode }" :key="mode[0]">{{ mode[0] }}</button>
		<p v-if="gameMode">{{ gameMode[1] }}</p>
		<table v-if="rules">
			<tr>
				<td class="text-faint">Creeps</td><td>{{ rules.creeps === 'random' ? 'Random order' : rules.creeps === 'spawns' ? 'Spawns only' : 'Normal order' }}</td>
			</tr>
			<tr>
				<td class="text-faint">Towers</td><td>{{ rules.towers === 'random' ? 'Random set' : rules.towers === 'one' ? 'One of each' : 'All' }}</td>
			</tr>
			<tr v-if="!rules.sell">
				<td class="text-faint">Selling</td><td>Disabled</td>
			</tr>
			<tr v-if="rules.gold">
				<td class="text-faint">Gold</td><td>{{ rules.gold }}</td>
			</tr>
		</table>
	</div>

	<div v-if="multiplayer">
		<div v-if="notificationPermission !== 'granted'" class="mt-8">
			<div v-if="notificationPermission === 'unavailable'">
				(Notifications are unavailable in your browser.)
			</div>
			<div v-else-if="notificationPermission === 'denied'">
				To be notified when a game becomes available while this page is in the background, please enable notifications for this site in your browser settings.
			</div>
			<div v-else>
				<p class="text-sm text-faint">Get notified when a game becomes available while this page is in the background:</p>
				<button @click="onNotifications" class="big w-64 mt-1" :class="{ selected: readyRequested }">Enable notifications</button>
			</div>
		</div>
	</div>
	<div v-else-if="gameMode">
		<button @click="onPlaySingleplayer" class="big my-4">Play now</button>
		<Scores :mode="gameMode[0]" />
	</div>
</div>
</template>

<script>
import Scores from '@/components/Queue/Scores'

import bridge from '@/xjs/bridge'

export default {
	components: {
		Scores,
	},

	data () {
		return {
			gameMode: null,
			queueWait: 20,
			multiplayer: false,
			readyRequested: false,
			readyAt: 0,
			notificationPermission: null,
			hasFocusedWindow: false,
		}
	},

	arcadeModes: [
		[ 'normal', 'The classic.', {
			creeps: null,
			towers: null,
			sell: true,
		} ],
		[ 'random', 'Random random.', {
			creeps: 'random',
			towers: 'random',
			sell: true,
		} ],
	],

	baseUrl: process.env.BASE_URL,
	notification: null,
	readyTimer: null,

	computed: {
		rules () {
			return this.gameMode && this.gameMode[2]
		},

		readyRemaining () {
			return this.queueWait - this.readyAt
		},

		enoughPlayersForGame () {
			return this.queueCount > 1
		},

		queuedNames () {
			return this.$store.state.queue.names
		},
		queueCount () {
			return this.queuedNames.length
		},

		gameSizes () {
			return [1, 2, 3, 4] //CommonConsts.GAME_SIZES
		},
	},

	watch: {
		queuedNames (names) {
			const enough = names.length > 1
			this.setReadyTimer(enough)
			if (!enough && this.readyRequested) {
				this.readyRequested = false
			}
		},

		readyRequested (requested) {
			bridge.emit('queue ready', { ready: requested, mode: this.gameMode && this.gameMode[0] })
		},
	},

	created () {
		this.notificationPermission = window.Notification ? Notification.permission : 'unavailable'
	},

	mounted () {
		this.$nextTick(() => {
			if (this.$util.TESTING) {
				// return this.onPlaySingleplayer() //SAMPLE autostart
			}
		})

		bridge.on('disconnect', this.disconnect)
	},

	beforeDestroy () {
		bridge.off('disconnect', this.disconnect)
		this.setReadyTimer(false)
	},

	methods: {
		onMode (mode) {
			this.gameMode = mode
		},

		disconnect () {
			this.cancelTimer()
			if (this.multiplayer) {
				this.onMultiplayer(false)
			}
		},

		onMultiplayer (multiplayer) {
			this.readyRequested = false
			this.multiplayer = multiplayer
			this.gameMode = null
			bridge.emit('queue', multiplayer, (wait) => {
				this.queueWait = wait
			})
		},

		onPlaySingleplayer () {
			bridge.emit('singleplayer', this.gameMode[0])
		},

		cancelTimer () {
			if (this.$options.notification) {
				this.$options.notification.close()
				this.$options.notification = null
			}
			if (this.$options.readyTimer) {
				window.clearInterval(this.$options.readyTimer)
				this.$options.readyTimer = null
			}
			this.hasFocusedWindow = false
		},

		checkFocus () {
			if (!this.hasFocusedWindow && document.hasFocus()) {
				this.hasFocusedWindow = true
			}
		},

		setReadyTimer (enabled) {
			this.cancelTimer()

			if (enabled) {
				this.readyAt = 0
				this.$options.readyTimer = window.setInterval(() => {
					if (this.readyAt >= this.queueWait) {
						this.cancelTimer()
						if (!this.readyRequested) {
							this.onMultiplayer(false)
							window.alert('Removed from the queue due to inactivity')
						}
					} else {
						this.readyAt += 1
						this.checkFocus()
						if (this.readyAt === 3 && !this.readyRequested && !this.hasFocusedWindow && this.notificationPermission === 'granted') {
							this.$options.notification = new Notification('moba queue ready!', {
								icon: `${this.$options.baseUrl}icon.png`,
							})
							this.$options.notification.onclick = () => {
								if (window.parent) {
									parent.focus()
								}
								window.focus()
								this.$options.notification.close()
							}
						}
					}
				}, 1000)
			}
		},

		onReady () {
			this.readyRequested = !this.readyRequested
		},

		onNotifications () {
			Notification.requestPermission((permission) => {
				this.notificationPermission = permission
			})
		},
	},
}
</script>

<style lang="postcss" scoped>
.selection {
	@apply m-1 flex-grow rounded-full;
	&.selected {
		@apply bg-info;
	}
}

.ready-button.selected {
	@apply bg-success-light;
}

table {
	@apply m-auto text-left;
	border-spacing: 8px 0;
}
</style>
