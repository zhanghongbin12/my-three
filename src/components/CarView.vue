<template>
  <div ref="container" class="car-container"></div>
</template>

<script>
/* eslint-disable */
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

export default {
  name: 'CarView',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      model: null,
      controls: null,
      bodyMatetial: null,
      wheelMatetial: null,
      glassMaterial: null,
      composer: null,
      glowComposer: null,
      unrealBloomPass: null,
      lightOpen: true,
      animationId: null,
      resizeObserver: null
    }
  },
  mounted() {
    this.init()
    this.initBloomPass()
    this.initFloor()
    this.initLight()
    this.animate()
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.$refs.container)
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    this.dispose()
  },
  methods: {
    init() {
      const container = this.$refs.container
      const width = container.clientWidth
      const height = container.clientHeight

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color('#050914')

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({
        color: 'black'
      })
      this.mesh = new THREE.Mesh(geometry, material)

      this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000)
      this.camera.position.set(10, 6, 6)

      this.bodyMatetial = new THREE.MeshPhysicalMaterial({
        color: '#d71920',
        metalness: 1,
        roughness: 0.32,
        clearcoat: 0.85,
        clearcoatRoughness: 0.18
      })
      this.glassMaterial = new THREE.MeshPhysicalMaterial({
        color: '#222222',
        metalness: 0,
        roughness: 1,
        transmission: 1.0,
        opacity: 0.8,
        transparent: true
      })
      this.wheelMatetial = new THREE.MeshPhongMaterial({
        color: '#ffffff',
        metalness: 1,
        roughness: 0.5
      })

      const gltfLoader = new GLTFLoader()
      gltfLoader.load('./car.gltf', (gltf) => {
        this.model = gltf.scene
        this.model.traverse((item) => {
          if (['Obj3d66-870414-4-94', 'Obj3d66-870414-4-94_3'].includes(item.name)) {
            item.material = this.bodyMatetial
          }
          if (['Obj3d66-870414-4-94_1', 'Obj3d66-870414-4-94_2'].includes(item.name)) {
            item.material = this.glassMaterial
          }
          if (['Obj3d66-870414-4-94_12'].includes(item.name)) {
            item.material = new THREE.MeshStandardMaterial({
              color: 'black',
              roughness: 1,
              metalness: 0.1
            })
          }
          if (['Obj3d66-870414-4-94_13'].includes(item.name)) {
            item.material = this.wheelMatetial
          }
        })
        this.scene.add(this.model)
      })

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.setSize(width, height)
      this.renderer.setClearColor(0x050914, 1)
      container.appendChild(this.renderer.domElement)

      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.06
      this.controls.target.set(0, 0.7, 0)
      this.controls.minDistance = 6
      this.controls.maxDistance = 18
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate)
      if (this.controls) this.controls.update()
      if (this.lightOpen && this.composer && this.glowComposer) {
        this.glowComposer.render()
        this.composer.render()
      } else if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    },

    initFloor() {
      const floorGeometry = new THREE.PlaneGeometry(20, 20)
      const material = new THREE.MeshPhysicalMaterial({
        color: '#151a23',
        side: THREE.DoubleSide,
        metalness: 0,
        roughness: 0.35
      })
      const floorMesh = new THREE.Mesh(floorGeometry, material)
      floorMesh.rotation.x = Math.PI / 2
      floorMesh.receiveShadow = true
      this.scene.add(floorMesh)

      const grid = new THREE.GridHelper(20, 20, 0x3f4a5f, 0x1d2432)
      grid.material.transparent = true
      grid.material.opacity = 0.32
      this.scene.add(grid)
    },

    initBloomPass() {
      const size = new THREE.Vector2()
      this.renderer.getSize(size)

      this.composer = new EffectComposer(this.renderer)
      const renderPass = new RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)

      this.unrealBloomPass = new UnrealBloomPass(size, 1.5, 0.4, 0.85)
      this.unrealBloomPass.threshold = 1
      this.unrealBloomPass.strength = 1.5
      this.unrealBloomPass.radius = 1
      this.unrealBloomPass.renderToScreen = false

      this.glowComposer = new EffectComposer(this.renderer)
      this.glowComposer.renderToScreen = false
      this.glowComposer.addPass(new RenderPass(this.scene, this.camera))
      this.glowComposer.addPass(this.unrealBloomPass)

      const shaderPass = new ShaderPass(
        new THREE.ShaderMaterial({
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: this.glowComposer.renderTarget2.texture },
            tDiffuse: {
              value: null
            }
          },
          vertexShader:
            'varying vec2 vUv;\n' +
            'void main() {\n' +
            '  vUv = uv;\n' +
            '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n' +
            '}',
          fragmentShader:
            'uniform sampler2D baseTexture;\n' +
            'uniform sampler2D bloomTexture;\n' +
            'varying vec2 vUv;\n' +
            'void main() {\n' +
            '  gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv);\n' +
            '}',
          defines: {}
        }),
        'baseTexture'
      )

      shaderPass.renderToScreen = true
      shaderPass.needsSwap = true
      this.composer.addPass(shaderPass)
    },

    initLight() {
      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(0, 4, 10)
      this.scene.add(light)

      const light2 = new THREE.DirectionalLight(0x9cc8ff, 1.25)
      light2.position.set(-8, 10, 5)
      this.scene.add(light2)

      const light3 = new THREE.DirectionalLight(0xffddd0, 1)
      light3.position.set(8, 5, -8)
      this.scene.add(light3)

      const ambient = new THREE.AmbientLight(0x22304a, 0.9)
      this.scene.add(ambient)
    },

    onResize() {
      if (!this.camera || !this.renderer || !this.$refs.container) return
      const width = this.$refs.container.clientWidth
      const height = this.$refs.container.clientHeight
      if (!width || !height) return
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
      if (this.composer) this.composer.setSize(width, height)
      if (this.glowComposer) this.glowComposer.setSize(width, height)
    },

    dispose() {
      window.removeEventListener('resize', this.onResize)
      if (this.resizeObserver) this.resizeObserver.disconnect()
      if (this.animationId) cancelAnimationFrame(this.animationId)
      if (this.controls) this.controls.dispose()
      if (this.scene) {
        this.scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material]
            materials.forEach((material) => material.dispose())
          }
        })
      }
      if (this.composer) this.composer.dispose()
      if (this.glowComposer) this.glowComposer.dispose()
      if (this.renderer) {
        this.renderer.dispose()
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
        }
      }
    }
  }
}
</script>

<style scoped>
.car-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 68% 28%, #1f2937 0%, #090d18 42%, #030712 100%);
}
</style>
