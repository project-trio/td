import { Group, CircleBufferGeometry, PlaneBufferGeometry, RingBufferGeometry, Mesh, MeshBasicMaterial } from 'three'

// import Vox from '@/play/external/vox'

export default {

	group (parent) {
		const group = new Group()
		parent.add(group)
		return group
	},

	remove (object) {
		return object.parent.remove(object)
	},

	// Voxels

	// voxelMesh (mesh, options) {
	// 	mesh.rotation.x = Math.PI / 2
	// 	if (options.z) {
	// 		mesh.position.z = options.z
	// 	}
	// 	if (options.parent) {
	// 		options.parent.add(mesh)
	// 	}
	// 	if (options.opacity !== undefined) {
	// 		mesh.material.transparent = true
	// 		mesh.material.opacity = options.opacity
	// 	}
	// 	mesh.castShadow = true
	// 	mesh.receiveShadow = true
	// 	mesh.owner = options.owner
	// 	return mesh
	// },
	//
	// voxel (type, name, options) {
	// 	new Vox.Parser().parse(require(`@/client/assets/${type}/${name}.vox`)).then((voxelData) => {
	// 		const builder = new Vox.MeshBuilder(voxelData, { voxelSize: options.size || 2 })
	// 		const mesh = builder.createMesh()
	// 		mesh.material.color.setHex(options.color)
	// 		return this.voxelMesh(mesh, options)
	// 	})
	// },
	//
	// generate (type, name, count, size, container, x, y, width, height) {
	// 	new Vox.Parser().parse(require(`@/client/assets/${type}/${name}.vox`)).then((voxelData) => {
	// 		const builder = new Vox.MeshBuilder(voxelData, { voxelSize: size })
	// 		for (let i = 0; i < count; i += 1) {
	// 			const mesh = builder.createMesh()
	// 			mesh.castShadow = true
	// 			mesh.receiveShadow = true
	// 			mesh.position.set(x + Math.random() * Math.random() * Math.random() * width, y + Math.random() * Math.random() * Math.random() * height, 0)
	// 			mesh.rotation.x = Math.PI / 2
	// 			mesh.rotation.y = Math.PI * 2 * Math.random()
	// 			container.add(mesh)
	// 		}
	// 	})
	// },

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

	circle (radius, options) {
		const segments = Math.ceil(radius / 16) * 12
		const geometry = new CircleBufferGeometry(radius, segments)
		const material = new MeshBasicMaterial({ color: options.color })
		if (options.opacity !== undefined) {
			material.transparent = true
			material.opacity = options.opacity
		}
		const mesh = new Mesh(geometry, material)
		if (options.parent) {
			options.parent.add(mesh)
		}
		return mesh
	},

	ring (innerRadius, size, options) {
		const segments = options.segments || Math.ceil(innerRadius / 16) * 8
		const geometry = new RingBufferGeometry(innerRadius, innerRadius + size, segments)
		const material = new MeshBasicMaterial({ color: options.color })
		if (options.opacity !== undefined) {
			material.transparent = true
			material.opacity = options.opacity
		}
		const mesh = new Mesh(geometry, material)
		if (options.parent) {
			options.parent.add(mesh)
		}
		return mesh
	},

}
