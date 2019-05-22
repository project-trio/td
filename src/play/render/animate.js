import store from '@/xjs/store'

const animations = []

export default {

	add (target, property, data) {
		const overwrite = data.overwrite
		if (overwrite) {
			for (const animation of animations) {
				if (animation.overwrite === overwrite) {
					animation.from = target[property]
					animation.to = data.to
					if (animation.from > animation.to) {
						animation.change = -(animation.from - animation.to)
					} else {
						animation.change = +(animation.to - animation.from)
					}
					animation.start = data.start
					return
				}
			}
		}
		if (property === 'opacity') {
			target = target.material
			if (!target.transparent) {
				target.transparent = true
				if (data.to !== 0) {
					data.resetTransparent = true
				}
			}
		}
		data.target = target
		data.property = property
		const checkProperty = property === 'xyz' ? 'x' : property
		if (data.from !== undefined) {
			if (data.to !== undefined) {
				if (property === 'xyz') {
					target.set(data.from, data.from, data.from)
				} else {
					target[checkProperty] = data.from
				}
			} else {
				data.to = target[checkProperty]
				if (data.delta) {
					data.from = data.to + data.from
					target[checkProperty] = data.from
				}
			}
		} else {
			data.from = target[checkProperty]
			if (data.delta) {
				data.to = data.from + data.to
				target[checkProperty] = data.to
			}
		}
		if (data.from > data.to) {
			data.change = -(data.from - data.to)
		} else {
			data.change = +(data.to - data.from)
		}
		if (!data.start) {
			data.start = store.state.game.renderTime
		}
		animations.push(data)
	},

	update (renderTime) {
		for (let idx = animations.length - 1; idx >= 0; idx -= 1) {
			const animation = animations[idx]
			const startTime = animation.start
			const timeElapsed = renderTime - startTime
			if (timeElapsed <= 0) {
				continue
			}
			const target = animation.target
			const duration = animation.duration
			let currentValue
			if (renderTime >= startTime + duration) {
				animations.splice(idx, 1)
				if (animation.onComplete) {
					animation.onComplete()
				}
				if (animation.removes) {
					continue
				}
				currentValue = animation.to
				if (animation.resetTransparent) {
					target.transparent = false
				}
			} else if (animation.parabola) {
				const halfDuration = duration / 2
				const progress = 1 - Math.pow((timeElapsed - halfDuration) / halfDuration, animation.parabola)
				currentValue = animation.from + (progress > 0.999 ? 1 : progress) * animation.max
			} else {
				let progress = timeElapsed / duration
				if (animation.pow) {
					progress = 1 - Math.pow(1 - progress, animation.pow)
				}
				currentValue = animation.from + progress * animation.change
			}
			const property = animation.property
			if (property === 'xyz') {
				target.set(currentValue, currentValue, currentValue)
			} else {
				target[property] = currentValue
			}
		}
	},

	cancel (target, property) {
		for (let idx = animations.length - 1; idx >= 0; idx -= 1) {
			const animation = animations[idx]
			if (animation.target === target && animation.property === property) {
				animations.splice(idx, 1)
				return true
			}
		}
		return false
	},

}
