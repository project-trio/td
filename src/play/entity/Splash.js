import { CircleBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import render from '@/play/render'
import animate from '@/play/render/animate'

import towers from '@/play/data/towers'

const rangesCache = {}
const splashesCache = {}
for (const name in towers) {
	if (name === 'names') {
		continue
	}
	const towerData = towers[name]
	const ranges = name === 'bash' ? towerData.range : towerData.radius
	if (ranges) {
		const splashMaterial = new MeshBasicMaterial({ color: towerData.color })
		splashMaterial.transparent = true
		splashMaterial.opacity = 0.3
		splashesCache[name] = splashMaterial

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
		const rangeGeometry = rangesCache[radius]
		if (!rangeGeometry) {
			return console.error('Invalid Splash radius', source.name, radius)
		}
		const splash = new Mesh(rangeGeometry, splashesCache[source.name].clone())
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
