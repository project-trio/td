import { CircleBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import towers from '@/play/data/towers'

import render from '@/play/render'
import animate from '@/play/render/animate'

const rangesCache = {}
const splashesCache = {}
for (const name in towers) {
	if (name === 'names') {
		continue
	}
	const towerData = towers[name]
	const splashMaterial = new MeshBasicMaterial({ color: towerData.color })
	splashMaterial.transparent = true
	splashMaterial.opacity = 0.3
	splashesCache[name] = splashMaterial

	const ranges = towerData.radius
	if (ranges) {
		let range = 0
		for (const diff of ranges) {
			if (diff) {
				range += diff
				if (!rangesCache[range]) {
					rangesCache[range] = new CircleBufferGeometry(range * 2, range * 2)
				}
			}
		}
	}
}

export default class Splash {

	constructor (renderTime, source, at, radius, parent) {
		const splash = new Mesh(rangesCache[radius], splashesCache[source.name].clone())
		if (at) {
			const { cX, cY } = at
			splash.position.x = cX
			splash.position.y = cY
		}

		animate.add(splash, 'opacity', {
			start: renderTime,
			to: 0,
			duration: 500,
			removes: true,
			onComplete () {
				render.remove(splash)
			},
		})

		parent.add(splash)
	}

}
