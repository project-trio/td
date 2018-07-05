import { Scene, AmbientLight, DirectionalLight, WebGLRenderer, PerspectiveCamera, OrthographicCamera, BasicShadowMap, PCFSoftShadowMap } from 'three'

import store from '@/xjs/store'

import Pointer from '@/play/render/Pointer'

const CAMERA_FOV = 20

const PERSPECTIVE_CAMERA = true
const CAMERA_HEIGHT = 192 / (CAMERA_FOV / 180)

export default class Renderer {

	constructor (canvas) {
		const gameScene = new Scene()

		const ambientLight = new AmbientLight(0x888888, 1)
		gameScene.add(ambientLight)

		const gameLight = new DirectionalLight(0xaaaaaa, 1)
		gameScene.add(gameLight)
		gameLight.position.set(0, 0, 128)
		gameLight.target.position.set(10, -10, -128)
		gameScene.add(gameLight.target)

		const projectionSize = 400
		gameLight.shadow.camera.left = -projectionSize
		gameLight.shadow.camera.right = projectionSize
		gameLight.shadow.camera.top = projectionSize
		gameLight.shadow.camera.bottom = -projectionSize

		gameLight.shadow.mapSize.width = 1024
		gameLight.shadow.mapSize.height = 1024
		// gameLight.shadow.bias = 0.001

		// audioListener = RenderSound.create(audioListener)

		// const helper = new CameraHelper(gameLight.shadow.camera)
		// gameScene.add(helper)

		this.canvas = canvas
		this.gameScene = gameScene
		this.gameLight = gameLight

		this.container = gameScene
		this.pointer = new Pointer(canvas, gameScene)

		this.createRenderer()

		this.resizeThis = this.resize.bind(this)
		window.addEventListener('resize', this.resizeThis)
	}

	destroy () {
		this.pointer.destroy()
		window.removeEventListener('resize', this.resizeThis)
	}

	resize () {
		const width = window.innerWidth - 256
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
			const visibleFOV = this.gameCamera.fov * Math.PI / 180
			const visibleHeight = 2 * Math.tan(visibleFOV / 2) * CAMERA_HEIGHT
			const visibleWidth = visibleHeight * this.gameCamera.aspect
			let widthAspect
			if (width > 640) {
				widthAspect = visibleWidth / width * Math.min(width / 640, 1.25)
			} else {
				widthAspect = visibleWidth / 640
			}
			const heightAspect = visibleHeight / 524
			this.gameCamera.zoom = Math.min(widthAspect, heightAspect)
		} else {
			const zoom = 2
			this.gameCamera.left = -width / zoom
			this.gameCamera.right = width / zoom
			this.gameCamera.top = height / zoom
			this.gameCamera.bottom = -height / zoom
		}
		this.gameCamera.updateProjectionMatrix()
	}

	createRenderer () {
		this.pixelMultiplier = null

		this.renderer = new WebGLRenderer({
			antialias: true,
			canvas: this.canvas,
		})

		this.perspectiveCamera = new PerspectiveCamera(CAMERA_FOV)
		this.perspectiveCamera.position.z = CAMERA_HEIGHT
		this.perspectiveCamera.zoom = 0.75
		this.orthoCamera = new OrthographicCamera()
		this.orthoCamera.position.z = 100

		const shadowQuality = store.state.settings.shadows
		const renderShadow = shadowQuality >= 1
		this.gameLight.castShadow = renderShadow
		this.renderer.shadowMap.enabled = renderShadow
		if (renderShadow) {
			this.renderer.shadowMap.type = shadowQuality >= 2 ? PCFSoftShadowMap : BasicShadowMap
		}

		this.resize()
	}

	update () {
		this.pointer.update(this.gameCamera)
		this.renderer.render(this.gameScene, this.gameCamera)
	}

}
