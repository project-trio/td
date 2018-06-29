import { Raycaster, Vector2 } from 'three'

const raycaster = new Raycaster()
const pointerLocation = new Vector2()

let intersecting = null
let canvas = null

const onMouseMove = (event) => {
	pointerLocation.x = ((event.clientX - 256) / canvas.width) * 2 - 1
	pointerLocation.y = -(event.clientY / canvas.height) * 2 + 1
}

const onClick = (event) => {
	const button = event.button
	for (const intersect of intersecting) {
		const owner = intersect.object.owner
		if (owner && owner.onClick) {
			if (owner.onClick(intersect.point, button)) {
				return false
			}
		}
	}
}

export default class Pointer {

	constructor (_canvas, container) {
		this.intersectContainer = container
		intersecting = []
		this.hovering = {}
		canvas = _canvas

		canvas.addEventListener('mousedown', onClick)
		canvas.addEventListener('mousemove', onMouseMove)
	}

	destroy () {
		intersecting = null
		canvas.removeEventListener('mousedown', onClick)
		canvas.removeEventListener('mousemove', onMouseMove)
		canvas = null
	}

	update (camera) {
		raycaster.setFromCamera(pointerLocation, camera)

		intersecting = raycaster.intersectObjects(this.intersectContainer.children, true)
		const newHovering = {}
		for (const intersect of intersecting) {
			const owner = intersect.object.owner
			if (owner && owner.onHover) {
				if (!this.hovering[owner.id]) {
					owner.onHover(intersect.point)
				} else if (owner.onMove) {
					owner.onMove(intersect.point)
				}
				newHovering[owner.id] = owner
			}
		}
		for (const id in this.hovering) {
			const newOwner = newHovering[id]
			if (!newOwner) {
				this.hovering[id].onBlur()
			}
		}
		this.hovering = newHovering
	}

}
