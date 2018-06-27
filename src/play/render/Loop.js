import Stats from 'stats.js'

import store from '@/xjs/store'

import Bullet from '@/play/Game/entity/Bullet'
import Unit from '@/play/Game/entity/Unit'

const storeSettings = store.state.settings

export default class Loop {

	constructor (game) {
		this.game = game
		this.animateThis = this.animate.bind(this)
		window.requestAnimationFrame(this.animateThis)

		this.previousTimestamp = 0
		this.lastTickTime = 0
		this.framePanel = new Stats()
		this.framePanel.showPanel(0)
		document.body.appendChild(this.framePanel.dom)

		if (store.state.signin.user.id === 1) {
			this.tickPanel = new Stats()
			this.tickPanel.showPanel(1)
			document.body.appendChild(this.tickPanel.dom)
			this.tickPanel.dom.style.top = '48px'

			this.updatePanel = new Stats()
			this.updatePanel.showPanel(1)
			document.body.appendChild(this.updatePanel.dom)
			game.updatePanel = this.updatePanel
			this.framePanel.dom.style.top = '96px'
		}
	}

	animate (timestamp) {
		const game = this.game
		if (!game || game.finished) {
			return
		}
		window.requestAnimationFrame(this.animateThis)

		const isPlaying = store.state.game.playing
		if (isPlaying && this.framePanel) {
			this.framePanel.begin()
		}
		const ticksToRender = game.calculateTicksToRender(timestamp)
		if (ticksToRender > 0) {
			const processUpdate = isPlaying && this.tickPanel
			if (processUpdate) {
				this.tickPanel.begin()
			}

			game.performTicks(ticksToRender)

			if (processUpdate) {
				this.tickPanel.end()
			}
			this.lastTickTime = timestamp
		} else if (isPlaying) { // Tween
			if (storeSettings.fpsCap) {
				return
			}
			const tweenTimeDelta = timestamp - this.previousTimestamp
			const renderTime = store.state.game.renderTime + (timestamp - this.lastTickTime)
			Bullet.update(renderTime, tweenTimeDelta, true)
			Unit.update(renderTime, tweenTimeDelta, true)
		}

		game.renderer.update()

		if (this.framePanel && isPlaying) {
			this.framePanel.end()
		}
		this.previousTimestamp = timestamp
	}

}
