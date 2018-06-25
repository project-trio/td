import { Raycaster, Vector2 } from 'three'

const raycaster = new Raycaster()
const pointerLocation = new Vector2()

//LISTENER

function onMouseMove (event) {
	pointerLocation.x = (event.clientX / window.innerWidth) * 2 - 1
	pointerLocation.y = -(event.clientY / window.innerHeight) * 2 + 1
}

function onClick (event) {
	const rightClick = event.which ? event.which === 3 : event.button >= 2
	for (const intersect of this.intersecting) {
		const owner = intersect.object.owner
		if (owner && owner.onClick) {
			if (owner.onClick(intersect.point, rightClick)) {
				return false
			}
		}
	}
}

//PUBLIC

export default class Pointer {

	constructor (canvas, container) {
		this.intersectContainer = container
		this.hovering = {}

		canvas.addEventListener('mousedown', onClick)
		canvas.addEventListener('mousemove', onMouseMove)
		canvas.addEventListener('contextmenu', onClick)
	}

	destroy (canvas) {
		canvas.removeEventListener('mousedown', onClick)
		canvas.removeEventListener('mousemove', onMouseMove)
		canvas.removeEventListener('contextmenu', onClick)
	}

	reposition (camera) {
		raycaster.setFromCamera(pointerLocation, camera)

		this.intersecting = raycaster.intersectObjects(this.intersectContainer.children, true)
		const newHovering = {}
		for (const intersect of this.intersecting) {
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
