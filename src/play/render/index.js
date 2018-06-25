import * as THREE from 'three'

// import Vox from '@/play/external/vox'

export default {

	group () {
		return new THREE.Group()
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

	rectangle (x, y, w, h, options) {
		const geometry = new THREE.PlaneBufferGeometry(w, h)
		const material = new THREE.MeshBasicMaterial({ color: options.color })
		const rectangle = new THREE.Mesh(geometry, material)
		rectangle.position.set(x, y, options.z || 0)
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
		const segments = Math.ceil(radius / 16) * 8
		const geometry = new THREE.CircleBufferGeometry(radius, segments)
		const material = new THREE.MeshBasicMaterial({ color: options.color })
		if (options.opacity !== undefined) {
			material.transparent = true
			material.opacity = options.opacity
		}
		const mesh = new THREE.Mesh(geometry, material)
		if (options.parent) {
			options.parent.add(mesh)
		}
		return mesh
	},

	ring (innerRadius, size, options) {
		const segments = options.segments || Math.ceil(innerRadius / 16) * 8
		const geometry = new THREE.RingBufferGeometry(innerRadius, innerRadius + size, segments)
		const material = new THREE.MeshBasicMaterial({ color: options.color })
		if (options.opacity !== undefined) {
			material.transparent = true
			material.opacity = options.opacity
		}
		const mesh = new THREE.Mesh(geometry, material)
		if (options.parent) {
			options.parent.add(mesh)
		}
		return mesh
	},

}
