<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { clearWipBrandSelection } from './composables/useWipBrandPathState.js'
import { resetWipTypeQueue } from './composables/useWipTypeQueue.js'
import WipPageFrame from './components/WipPageFrame.vue'
import WipNav from './components/WipNav.vue'
import WipFixedNav from './components/WipFixedNav.vue'
import WipHeroWordmark from './components/WipHeroWordmark.vue'
import WipGallery from './components/WipGallery.vue'
import WipDoubleDash from './components/WipDoubleDash.vue'
import WipWalkthrough from './components/WipWalkthrough.vue'
import splashSrc from './assets/fd-splash.png'
import { wipBackgroundById } from './data/backgrounds.js'
import './tokens/layout.css'

resetWipTypeQueue()

const showGrid = ref(false)
const font = ref('serif')
const background = ref('white')
const markColor = computed(() => wipBackgroundById(background.value).mark)
const pageStyle = computed(() => {
  const swatch = wipBackgroundById(background.value)
  if (!swatch.dark) return { '--wip-bg': swatch.color }
  return {
    '--wip-bg': swatch.color,
    '--wip-ink': '#ffffff',
    '--wip-ink-soft': 'rgba(255, 255, 255, 0.72)',
    '--wip-rule': '#ffffff',
  }
})
const showFixedNav = ref(false)
const showSplash = ref(true)
const scrollRoot = ref(null)
const navBlock = ref(null)
const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let navObserver
let splashTimer

function onCanvasPointerDown(event) {
  if (event.target.closest('.wip-wordmark')) return
  clearWipBrandSelection()
}

onMounted(() => {
  splashTimer = window.setTimeout(() => {
    showSplash.value = false
  }, reduceMotion ? 400 : 2200)

  if (!scrollRoot.value || !navBlock.value) return

  navObserver = new IntersectionObserver(
    ([entry]) => {
      showFixedNav.value = !entry.isIntersecting
    },
    { root: scrollRoot.value, threshold: 0 },
  )
  navObserver.observe(navBlock.value)
})

onBeforeUnmount(() => {
  window.clearTimeout(splashTimer)
  navObserver?.disconnect()
})
</script>

<template>
  <div ref="scrollRoot" class="wip-root" :class="{ 'wip-root--mono': font === 'mono' }" :style="pageStyle">
    <WipFixedNav
      v-model:show-grid="showGrid"
      v-model:visible="showFixedNav"
      v-model:font="font"
      v-model:background="background"
    />
    <div class="wip-canvas" @pointerdown="onCanvasPointerDown">
      <WipPageFrame :show-grid="showGrid" />
      <main class="wip-grid">
        <div ref="navBlock" class="wip-nav-block">
          <WipNav v-model:show-grid="showGrid" v-model:font="font" v-model:background="background" />
        </div>
        <WipHeroWordmark :mark-color="markColor" />
        <WipGallery />
        <WipDoubleDash />
        <WipWalkthrough />
      </main>
    </div>
    <motion.div
      v-if="showSplash"
      class="wip-splash"
      :initial="{ opacity: reduceMotion ? 1 : 0 }"
      :animate="{ opacity: reduceMotion ? [1, 0] : [0, 1, 1, 0] }"
      :transition="
        reduceMotion
          ? { duration: 0.3, delay: 0.1 }
          : { duration: 2.1, times: [0, 0.105, 0.819, 1], ease: 'easeInOut' }
      "
      aria-hidden="true"
    >
      <img :src="splashSrc" alt="" />
    </motion.div>
  </div>
</template>

<style scoped>
.wip-root {
  height: 100%;
  overflow: auto;
  background: var(--wip-bg);
  color: var(--wip-ink);
}

.wip-root--mono,
.wip-root--mono :deep(*) {
  font-family: 'Figma Mono VF', ui-monospace, monospace;
  font-variation-settings: normal;
}

.wip-canvas {
  position: relative;
  width: 100%;
  max-width: var(--wip-design-width);
  min-height: 100%;
  margin-inline: auto;
}

.wip-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(var(--wip-columns), minmax(0, 1fr));
  align-content: start;
  column-gap: var(--wip-gutter);
  row-gap: 0;
  min-height: calc(100vh - var(--wip-frame-top));
  padding: calc(var(--wip-frame-top) + 9px) var(--wip-margin) 120px;
}

.wip-nav-block {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
}

.wip-splash {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
}

.wip-splash img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
