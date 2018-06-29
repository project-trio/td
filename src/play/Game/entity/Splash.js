import { CircleBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

import render from '@/play/render'

import towers from '@/play/data/towers'

let allSplashes = []

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

class Splash {

	constructor (source, at, radius, parent) {
		const area = new Mesh(rangesCache[radius], splashesCache[source.name].clone())
		if (at) {
			const { cX, cY } = at
			area.position.x = cX
			area.position.y = cY
		}
		parent.add(area)
		allSplashes.push(area)
	}

}

//STATIC

Splash.destroy = function () {
	allSplashes = []
}

Splash.update = function (renderTime, timeDelta, _tweening) {
	const splashFade = timeDelta / 1000
	for (let idx = allSplashes.length - 1; idx >= 0; idx -= 1) {
		const splash = allSplashes[idx]
		if (splash.opacity < splashFade) {
			allSplashes.splice(idx, 1)
			render.remove(splash)
		} else {
			splash.material.opacity -= splashFade
		}
	}
}

export default Splash
