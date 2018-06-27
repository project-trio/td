import { Raycaster, Vector2 } from 'three'

const raycaster = new Raycaster()
const pointerLocation = new Vector2()

let intersecting = null

const onMouseMove = (event) => {
	pointerLocation.x = (event.clientX / window.innerWidth) * 2 - 1
	pointerLocation.y = -(event.clientY / window.innerHeight) * 2 + 1
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

	constructor (canvas, container) {
		this.intersectContainer = container
		intersecting = []
		this.hovering = {}

		canvas.addEventListener('mousedown', onClick)
		canvas.addEventListener('mousemove', onMouseMove)
	}

	destroy (canvas) {
		intersecting = null
		canvas.removeEventListener('mousedown', onClick)
		canvas.removeEventListener('mousemove', onMouseMove)
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
