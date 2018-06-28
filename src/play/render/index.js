import { Group, PlaneBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

export default {

	group (parent) {
		const group = new Group()
		parent.add(group)
		return group
	},

	remove (object) {
		return object.parent.remove(object)
	},

	// Shapes

	rectangle (w, h, options) {
		const geometry = new PlaneBufferGeometry(w, h)
		const material = new MeshBasicMaterial({ color: options.color })
		const rectangle = new Mesh(geometry, material)
		if (options.parent) {
			options.parent.add(rectangle)
		}
		if (options.noDepth) {
			material.depthTest = false
			rectangle.renderOrder = 999999999
		}
		return rectangle
	},

}
