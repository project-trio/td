import Stats from 'stats.js'

import store from '@/app/store'

import local from '@/play/local'
import animate from '@/play/render/animate'

import Bullet from '@/play/entity/Bullet'
import Creep from '@/play/entity/Unit/Creep'
import Tower from '@/play/entity/Unit/Tower'

const storeSettings = store.state.settings

export default class Loop {

	constructor () {
		this.animateThis = this.animate.bind(this)
		this.animationId = window.requestAnimationFrame(this.animateThis)

		this.previousTimestamp = 0
		this.lastTickTime = 0
		this.framePanel = new Stats()
		this.framePanel.showPanel(0)
		document.body.appendChild(this.framePanel.dom)
	}

	animate (timestamp) {
		const gameState = store.state.game
		if (gameState.finished) {
			return
		}
		this.animationId = window.requestAnimationFrame(this.animateThis)
		const game = local.game
		const renderer = local.renderer
		if (!game || !renderer) {
			return
		}

		const isPlaying = gameState.playing
		if (isPlaying && this.framePanel) {
			this.framePanel.begin()
		}
		const ticksToRender = game.calculateTicksToRender(timestamp)
		let renderTime = null
		if (ticksToRender > 0) {
			game.performTicks(ticksToRender, isPlaying)
			this.lastTickTime = timestamp
			renderTime = gameState.renderTime
		} else if (isPlaying) { // Tween
			if (storeSettings.fpsCap) {
				return
			}
			const tweenTimeDelta = timestamp - this.previousTimestamp
			renderTime = gameState.renderTime + (timestamp - this.lastTickTime)
			Bullet.update(renderTime, tweenTimeDelta, true)
			Creep.update(renderTime, tweenTimeDelta, true)
			Tower.update(renderTime, tweenTimeDelta, true)
		} else {
			Tower.update(null)
		}

		if (renderTime !== null) {
			animate.update(renderTime)
		}
		renderer.update()

		if (this.framePanel && isPlaying) {
			this.framePanel.end()
		}
		this.previousTimestamp = timestamp
	}

	destroy () {
		window.cancelAnimationFrame(this.animationId)

		if (this.framePanel) {
			this.framePanel.dom.remove()
		}
	}

}
