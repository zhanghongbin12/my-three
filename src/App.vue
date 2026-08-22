<template>
  <div id="app">
    <main class="stage" :class="`stage-${currentProject}`">
      <transition name="scene-fade" mode="out-in">
        <component :is="activeComponent" :key="currentProject" />
      </transition>
    </main>

    <header class="site-mark">
      <span class="mark-dot"></span>
      <div>
        <strong>3D Portfolio Lab</strong>
        <small>Vue 2 / Three.js</small>
      </div>
    </header>

    <section class="scene-copy" :key="`${currentProject}-copy`">
      <p class="scene-index">{{ activeProject.index }}</p>
      <h1>{{ activeProject.title }}</h1>
      <p class="scene-description">{{ activeProject.description }}</p>
      <div class="tech-list" aria-label="技术标签">
        <span v-for="tech in activeProject.tech" :key="tech">{{ tech }}</span>
      </div>
    </section>

    <nav class="scene-dock" aria-label="选择作品">
      <div class="dock-track" role="radiogroup" aria-label="Three.js works">
        <button
          v-for="project in projects"
          :key="project.value"
          type="button"
          class="dock-button"
          :class="{ active: currentProject === project.value }"
          :aria-pressed="currentProject === project.value"
          @click="currentProject = project.value"
        >
          <span>{{ project.short }}</span>
          <small>{{ project.name }}</small>
        </button>
      </div>
    </nav>
  </div>
</template>

<script>
import EarthView from './components/EarthView.vue'
import CarView from './components/CarView.vue'

export default {
  name: 'App',
  components: {
    EarthView,
    CarView
  },
  data() {
    return {
      currentProject: 'earth',
      projects: [
        {
          value: 'earth',
          index: 'PROJECT 01',
          short: 'Earth',
          name: 'my-three1',
          title: 'Planetary Scene',
          description: '地球纹理、云层、大气辉光和轨道控制组成的沉浸式行星展示。',
          tech: ['Three.js', 'Texture Mapping', 'ShaderMaterial', 'OrbitControls']
        },
        {
          value: 'car',
          index: 'PROJECT 02',
          short: 'Car',
          name: 'my-three2',
          title: 'Automotive Model',
          description: 'GLTF 模型加载、材质替换、灯光和后期辉光组合成的 3D 汽车展台。',
          tech: ['GLTFLoader', 'Mesh Material', 'Bloom Pass', 'Vue Component']
        }
      ]
    }
  },
  computed: {
    activeProject() {
      return this.projects.find((project) => project.value === this.currentProject)
    },
    activeComponent() {
      return this.currentProject === 'earth' ? 'EarthView' : 'CarView'
    }
  }
}
</script>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

* {
  box-sizing: border-box;
}

body {
  overflow: hidden;
  color: #ffffff;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: #030712;
}

#app {
  position: relative;
  min-width: 320px;
  background: #030712;
}

.stage {
  width: 100%;
  height: 100%;
}

.stage::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background:
    linear-gradient(90deg, rgba(3, 7, 18, 0.7) 0%, rgba(3, 7, 18, 0.2) 34%, rgba(3, 7, 18, 0) 62%),
    linear-gradient(0deg, rgba(3, 7, 18, 0.54) 0%, rgba(3, 7, 18, 0) 32%);
}

.stage-car::after {
  background:
    linear-gradient(90deg, rgba(3, 7, 18, 0.76) 0%, rgba(3, 7, 18, 0.24) 35%, rgba(3, 7, 18, 0.06) 68%),
    linear-gradient(0deg, rgba(3, 7, 18, 0.62) 0%, rgba(3, 7, 18, 0) 42%);
}

.site-mark {
  position: absolute;
  z-index: 10;
  top: 28px;
  left: 32px;
  display: flex;
  gap: 12px;
  align-items: center;
  color: #ffffff;
}

.mark-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #58d7ff;
  box-shadow: 0 0 22px rgba(88, 215, 255, 0.9);
}

.site-mark strong,
.site-mark small {
  display: block;
}

.site-mark strong {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.1;
}

.site-mark small {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 12px;
}

.scene-copy {
  position: absolute;
  z-index: 10;
  left: 32px;
  bottom: 96px;
  width: min(470px, calc(100vw - 64px));
  color: #ffffff;
  animation: copy-in 360ms ease both;
}

.scene-index {
  margin: 0 0 12px;
  color: #58d7ff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.scene-copy h1 {
  margin: 0;
  color: #ffffff;
  font-size: 54px;
  font-weight: 900;
  line-height: 0.96;
}

.scene-description {
  max-width: 430px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 1.8;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.tech-list span {
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  font-size: 12px;
}

.scene-dock {
  position: absolute;
  z-index: 10;
  right: 32px;
  bottom: 32px;
  left: 32px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.dock-track {
  display: flex;
  gap: 4px;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 999px;
  background: rgba(8, 13, 26, 0.58);
  backdrop-filter: blur(18px);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.26);
  pointer-events: auto;
}

.dock-button {
  min-width: 132px;
  height: 54px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.62);
  background: transparent;
  cursor: pointer;
}

.dock-button span,
.dock-button small {
  display: block;
}

.dock-button span {
  color: inherit;
  font-size: 15px;
  font-weight: 800;
}

.dock-button small {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 11px;
}

.dock-button.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.scene-fade-enter-active,
.scene-fade-leave-active {
  transition: opacity 320ms ease, transform 320ms ease;
}

.scene-fade-enter,
.scene-fade-leave-to {
  opacity: 0;
  transform: scale(1.01);
}

@keyframes copy-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 560px) {
  .stage::after,
  .stage-car::after {
    background:
      linear-gradient(180deg, rgba(3, 7, 18, 0.5) 0%, rgba(3, 7, 18, 0) 36%),
      linear-gradient(0deg, rgba(3, 7, 18, 0.78) 0%, rgba(3, 7, 18, 0.08) 54%);
  }

  .site-mark {
    top: 18px;
    left: 18px;
  }

  .scene-copy {
    left: 18px;
    bottom: 104px;
    width: calc(100vw - 36px);
  }

  .scene-copy h1 {
    font-size: 38px;
  }

  .scene-description {
    font-size: 14px;
    line-height: 1.65;
  }

  .scene-dock {
    right: 14px;
    bottom: 18px;
    left: 14px;
  }

  .dock-track {
    width: 100%;
  }

  .dock-button {
    min-width: 0;
    flex: 1;
    padding: 0 10px;
  }
}
</style>
