import Stats from 'stats.js'

import store from '@/xjs/store'

import animate from '@/play/render/animate'

import Bullet from '@/play/entity/Bullet'
import Creep from '@/play/entity/Unit/Creep'
import Tower from '@/play/entity/Unit/Tower'

const storeSettings = store.state.settings

export default class Loop {

	constructor (game) {
		this.game = game
		this.animateThis = this.animate.bind(this)
		this.animationId = window.requestAnimationFrame(this.animateThis)

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
		this.animationId = window.requestAnimationFrame(this.animateThis)

		const isPlaying = store.state.game.playing
		if (isPlaying && this.framePanel) {
			this.framePanel.begin()
		}
		const ticksToRender = game.calculateTicksToRender(timestamp)
		let renderTime
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
			renderTime = store.state.game.renderTime
		} else if (isPlaying) { // Tween
			if (storeSettings.fpsCap) {
				return
			}
			const tweenTimeDelta = timestamp - this.previousTimestamp
			renderTime = store.state.game.renderTime + (timestamp - this.lastTickTime)
			Bullet.update(renderTime, tweenTimeDelta, true)
			Creep.update(renderTime, tweenTimeDelta, true)
			Tower.update(renderTime, tweenTimeDelta, true)
		} else {
			Tower.update(null)
		}

		animate.update(renderTime)
		game.renderer.update()

		if (this.framePanel && isPlaying) {
			this.framePanel.end()
		}
		this.previousTimestamp = timestamp
	}

	stop () {
		window.cancelAnimationFrame(this.animationId)

		if (this.framePanel) {
			this.framePanel.dom.remove()
			if (this.updatePanel) {
				this.updatePanel.dom.remove()
				this.tickPanel.dom.remove()
			}
		}
	}

}
