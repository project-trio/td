import * as THREE from 'three'

import store from '@/xjs/store'

import Pointer from '@/play/render/Pointer'
import render from '@/play/render'

THREE.Cache.enabled = true

const CAMERA_FOV = 90
const CAMERA_OFF = 256
const CAMERA_HEIGHT = CAMERA_OFF / (CAMERA_FOV / 180)

const PERSPECTIVE_CAMERA = true //TODO

export default class Renderer {

	constructor (canvas) {
		const gameScene = new THREE.Scene()

		const ambientLight = new THREE.AmbientLight(0x666666, 1)
		gameScene.add(ambientLight)

		const gameLight = new THREE.DirectionalLight(0xdddddd, 1)
		gameScene.add(gameLight)
		gameLight.position.set(10, -50, 20)
		gameLight.target.position.set(15, -40, 0)
		gameScene.add(gameLight.target)

		const projectionSize = 1500
		gameLight.shadow.camera.left = -projectionSize
		gameLight.shadow.camera.right = projectionSize
		gameLight.shadow.camera.top = projectionSize
		gameLight.shadow.camera.bottom = -projectionSize
		gameLight.shadow.camera.near = 1
		gameLight.shadow.camera.far = 2048
		gameLight.shadow.mapSize.width = 2048
		gameLight.shadow.mapSize.height = 2048

		// audioListener = RenderSound.create(audioListener)

		// const helper = new THREE.CameraHelper(gameLight.shadow.camera)
		// gameScene.add(helper)

		this.canvas = canvas
		this.gameScene = gameScene
		this.gameLight = gameLight

		this.container = render.group(gameScene)
		this.pointer = new Pointer(canvas, this.container)

		this.createRenderer()

		window.addEventListener('resize', this.resize)
	}

	destroy () {
		this.pointer.destroy(this.canvas)
		window.removeEventListener('resize', this.resize)
	}

	resize () {
		const width = window.innerWidth
		const height = window.innerHeight

		if (PERSPECTIVE_CAMERA !== this.usePerspectiveCamera) {
			this.usePerspectiveCamera = PERSPECTIVE_CAMERA
			// if (this.gameCamera) {
			// 	this.gameCamera.remove(this.audioListener)
			// }
			if (this.usePerspectiveCamera) {
				this.gameCamera = this.perspectiveCamera
			} else {
				this.gameCamera = this.orthoCamera
			}
			this.gameCamera.position.z = CAMERA_HEIGHT
			this.pointer.update(this.gameCamera)
			// this.gameCamera.add(this.audioListener)
		}

		let newPixelMultiplier = window.devicePixelRatio / (store.state.settings.fullResolution ? 1 : 2)
		if (newPixelMultiplier !== this.pixelMultiplier) {
			this.pixelMultiplier = newPixelMultiplier
			this.renderer.setPixelRatio(newPixelMultiplier)
		}
		this.renderer.setSize(width, height)

		if (this.usePerspectiveCamera) {
			this.gameCamera.aspect = width / height
		} else {
			const cameraZoom = height / (CAMERA_OFF / 0.575)
			const zoomWidth = width / cameraZoom
			const zoomHeight = height / cameraZoom
			this.gameCamera.left = -zoomWidth
			this.gameCamera.right = zoomWidth
			this.gameCamera.top = zoomHeight
			this.gameCamera.bottom = -zoomHeight
		}
		this.gameCamera.updateProjectionMatrix()
	}

	createRenderer () {
		this.pixelMultiplier = null

		this.renderer = new THREE.WebGLRenderer({
			antialias: false,
			canvas: this.canvas,
		})

		this.perspectiveCamera = new THREE.PerspectiveCamera(CAMERA_FOV)
		this.orthoCamera = new THREE.OrthographicCamera()

		const shadowQuality = store.state.settings.shadows
		const renderShadow = shadowQuality >= 1
		this.gameLight.castShadow = renderShadow
		this.renderer.shadowMap.enabled = renderShadow
		if (renderShadow) {
			this.renderer.shadowMap.type = shadowQuality >= 2 ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap
		}

		this.resize()
	}

	update () {
		this.pointer.update(this.gameCamera)
		this.renderer.render(this.gameScene, this.gameCamera)
	}

}
