<template>
  <div ref="container" class="earth-container"></div>
</template>

<script>
/* eslint-disable */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const TEXTURES = {
  earth: '/textures/earth/earth_atmos_2048.jpg',
  specular: '/textures/earth/earth_specular_2048.jpg',
  clouds: '/textures/earth/earth_clouds_1024.png'
}

const ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ATMOSPHERE_FRAGMENT = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(0.35, 0.65, 1.0, 1.0) * intensity;
  }
`

export default {
  name: 'EarthView',
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      earthGroup: null,
      clouds: null,
      animationId: null,
      resizeObserver: null
    }
  },
  mounted() {
    this.initThree()
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.$refs.container)
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    this.dispose()
  },
  methods: {
    initThree() {
      const container = this.$refs.container
      const width = container.clientWidth
      const height = container.clientHeight

      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000)
      this.camera.position.set(0.4, 0.1, 7.4)

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.setSize(width, height)
      this.renderer.setClearColor(0x000000, 1)
      container.appendChild(this.renderer.domElement)

      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      this.controls.minDistance = 3.5
      this.controls.maxDistance = 12
      this.controls.autoRotate = true
      this.controls.autoRotateSpeed = 0.4
      this.controls.target.set(0.8, 0, 0)

      this.createStarfield()
      this.createLights()
      this.createEarth()
      this.animate()
    },

    createStarfield() {
      const starCount = 2500
      const positions = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount; i++) {
        const radius = 80 + Math.random() * 120
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = radius * Math.cos(phi)
      }
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
      })
      this.scene.add(new THREE.Points(geometry, material))
    },

    createLights() {
      this.scene.add(new THREE.AmbientLight(0x404060, 0.6))

      const sun = new THREE.DirectionalLight(0xffffff, 1.8)
      sun.position.set(5, 3, 5)
      this.scene.add(sun)

      const rim = new THREE.DirectionalLight(0x4488ff, 0.3)
      rim.position.set(-4, -2, -3)
      this.scene.add(rim)
    },

    createEarth() {
      const loader = new THREE.TextureLoader()
      const earthGroup = new THREE.Group()
      this.earthGroup = earthGroup
      earthGroup.position.set(1.25, -0.05, 0)

      const earthTexture = loader.load(TEXTURES.earth)
      const specularMap = loader.load(TEXTURES.specular)
      const cloudTexture = loader.load(TEXTURES.clouds)
      const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy()
      earthTexture.anisotropy = maxAnisotropy
      specularMap.anisotropy = maxAnisotropy
      cloudTexture.anisotropy = maxAnisotropy

      const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
      const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        specularMap,
        specular: new THREE.Color(0x333333),
        shininess: 15
      })
      earthGroup.add(new THREE.Mesh(earthGeometry, earthMaterial))

      const cloudGeometry = new THREE.SphereGeometry(2.02, 64, 64)
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      })
      this.clouds = new THREE.Mesh(cloudGeometry, cloudMaterial)
      earthGroup.add(this.clouds)

      const atmosphereGeometry = new THREE.SphereGeometry(2.15, 64, 64)
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
      })
      earthGroup.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial))

      this.scene.add(earthGroup)
    },

    onResize() {
      if (!this.camera || !this.renderer || !this.$refs.container) return
      const width = this.$refs.container.clientWidth
      const height = this.$refs.container.clientHeight
      if (!width || !height) return
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    },

    animate() {
      this.animationId = requestAnimationFrame(this.animate)

      if (this.earthGroup) {
        this.earthGroup.rotation.y += 0.001
      }
      if (this.clouds) {
        this.clouds.rotation.y += 0.0008
      }

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
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
.earth-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0a0a2e 0%, #000000 70%);
}
</style>
