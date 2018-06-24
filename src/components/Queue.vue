<template>
<div class="queue">
	<h1>{{ queueCount }} in queue</h1>
	<div class="mode-buttons">
		<button @click="onMultiplayer(false)" class="selection" :class="{ selected: !multiplayer }">Single player</button>
		<button @click="onMultiplayer(true)" class="selection" :class="{ selected: multiplayer }">Multiplayer</button>
	</div>

	<div v-if="multiplayer" class="multiplayer">
		<p class="mode-description">Compete against other players to clear the creeps the fastest!</p>
		<div class="queue-action">
			<div v-if="enoughPlayersForGame">
				<button @click="onReady" class="ready-button big" :class="{ selected: readyRequested }">{{ readyRequested ? 'ready!' : `ready? (${queueTimer - readyAt})` }}</button>
			</div>
		</div>
		<div v-if="multiplayer && notificationPermission !== 'granted'" class="queue-notification">
			<div v-if="notificationPermission === 'unavailable'">
				(Notifications are unavailable in your browser.)
			</div>
			<div v-else-if="notificationPermission === 'denied'">
				To be notified when a game becomes available while this page is in the background, please enable notifications for this site in your browser settings.
			</div>
			<div v-else class="notifications">
				<button @click="onNotifications" class="big" :class="{ selected: readyRequested }">Enable notifications!</button>
				<p class="text-small text-faint">Lets you know when a game is available while the page is in the background.</p>
			</div>
		</div>
	</div>
	<div v-else class="singleplayer">
		<p class="mode-description">Take on the creeps in solo training.</p>
		<button @click="onReady" class="big">Play now</button>
	</div>
</div>
</template>

<script>
import bridge from '@/xjs/bridge'
import router from '@/xjs/router'

export default {
	data () {
		return {
			queueTimer: 20,
			multiplayer: false,
			readyRequested: false,
			readyAt: 0,
			notificationPermission: null,
			hasFocusedWindow: false,
		}
	},

	baseUrl: process.env.BASE_URL,

	computed: {
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
		enoughPlayersForGame (enough) {
			if (!enough && this.readyRequested) {
				window.alert('Another player did not respond, and has been removed from the queue.')
			}
			this.setReadyTimer(enough)
		},

		readyRequested () {
			this.sendQueue()
		},
	},

	created () {
		this.notificationPermission = window.Notification ? Notification.permission : 'unavailable'
	},

	beforeDestroy () {
		this.setReadyTimer(false)
	},

	methods: {
		onMultiplayer (multiplayer) {
			this.multiplayer = multiplayer
			bridge.emit('queue', multiplayer)
		},

		cancelTimer () {
			if (this.notification) {
				this.notification.close()
				this.notification = null
			}
			if (this.readyTimer) {
				window.clearInterval(this.readyTimer)
				this.readyTimer = null
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
				this.readyTimer = window.setInterval(() => {
					if (this.readyAt >= this.queueTimer) {
						this.cancelTimer()
						if (!this.readyRequested) {
							router.replace({ name: 'Lobby' })
							window.alert('Removed from the queue due to inactivity')
						}
					} else {
						this.readyAt += 1
						this.checkFocus()
						if (this.readyAt === 3 && !this.hasFocusedWindow && this.notificationPermission === 'granted') {
							this.notification = new Notification('moba queue ready!', {
								icon: `${this.$options.baseUrl}icon.png`,
							})
							this.notification.onclick = () => {
								if (window.parent) {
									parent.focus()
								}
								window.focus()
								this.notification.close()
							}
						}
					}
				}, 1000)
			}
		},

		onReady () {
			this.readyRequested = !this.readyRequested
		},

		sendQueue () {
			this.setReadyTimer(this.enoughPlayersForGame)
			// Bridge.emit('queue', { ready: this.readyRequested })
		},

		onNotifications () {
			Notification.requestPermission((permission) => {
				this.notificationPermission = permission
			})
		},
	},
}
</script>

<style lang="stylus" scoped>
.queue
	text-align center

.selection
	margin 4px
	flex-grow 1
	border-radius 28px

.selection.selected
	background #dd6677

.ready-button.selected
	background-color #1ea

.mode-buttons
	margin-bottom 16px

.mode-description
	margin-bottom 32px
</style>
