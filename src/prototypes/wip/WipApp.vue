<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { clearWipBrandSelection } from './composables/useWipBrandPathState.js'
import { resetWipTypeQueue } from './composables/useWipTypeQueue.js'
import WipPageFrame from './components/WipPageFrame.vue'
import WipNav from './components/WipNav.vue'
import WipFixedNav from './components/WipFixedNav.vue'
import WipHeroWordmark from './components/WipHeroWordmark.vue'
import splashSrc from './assets/fd-splash.png'
import './tokens/layout.css'

resetWipTypeQueue()

const showGrid = ref(false)
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
  }, reduceMotion ? 400 : 2450)

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
  <div ref="scrollRoot" class="wip-root">
    <WipFixedNav v-model:show-grid="showGrid" v-model:visible="showFixedNav" />
    <div class="wip-canvas" @pointerdown="onCanvasPointerDown">
      <WipPageFrame :show-grid="showGrid" />
      <main class="wip-grid">
        <div ref="navBlock" class="wip-nav-block">
          <WipNav v-model:show-grid="showGrid" />
        </div>
        <WipHeroWordmark />
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
          : { duration: 2.45, times: [0, 0.082, 0.898, 1], ease: 'easeInOut' }
      "
      aria-hidden="true"
    >
      <img :src="splashSrc" alt="" />
    </motion.div>
  </div>
</template>

<style scoped>
.wip-root {
  --wip-columns: 6;
  height: 100%;
  overflow: auto;
  background: var(--wip-bg);
  color: #121212;
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
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 1200px;
  height: auto;
  transform: translate(-50%, -50%);
}
</style>
