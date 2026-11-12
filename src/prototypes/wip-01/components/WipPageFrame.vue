<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import WipAnimatedDash from './motion/WipAnimatedDash.vue'
import { spring, useWipReducedMotion } from '../composables/useWipMotion.js'

defineProps({
  showGrid: {
    type: Boolean,
    default: true,
  },
})

const topMarkerCount = 4
const reduceMotion = useWipReducedMotion()
const frameEl = ref(null)
const sideSegments = ref([{ top: 0, height: 0 }])

let frameObserver

function measureSegments() {
  const frame = frameEl.value
  if (!frame) return
  const total = frame.offsetHeight
  const step = window.innerHeight || total
  const next = []
  for (let top = 0; top < total; top += step) {
    next.push({ top, height: Math.min(step, total - top) })
  }
  sideSegments.value = next.length ? next : [{ top: 0, height: total }]
}

onMounted(() => {
  measureSegments()
  frameObserver = new ResizeObserver(measureSegments)
  if (frameEl.value) frameObserver.observe(frameEl.value)
  window.addEventListener('resize', measureSegments)
})

onBeforeUnmount(() => {
  frameObserver?.disconnect()
  window.removeEventListener('resize', measureSegments)
})

function markerMotion(index) {
  const delay = 0.42 + (index - 1) * 0.055
  const reveal = { scale: 1, opacity: 1 }
  const hidden = { scale: 0, opacity: 0 }

  if (reduceMotion.value) {
    return { initial: reveal, animate: reveal }
  }

  return {
    initial: hidden,
    animate: reveal,
    transition: { ...spring, delay },
  }
}
</script>

<template>
  <div ref="frameEl" class="wip-frame" aria-hidden="true">
    <div class="rules">
      <WipAnimatedDash class="rule rule--top" axis="x" trigger="inView" />
      <template v-for="(segment, index) in sideSegments" :key="index">
        <WipAnimatedDash
          class="rule rule--left"
          axis="y"
          trigger="inView"
          :style="{ top: `${segment.top}px`, height: `${segment.height}px` }"
        />
        <WipAnimatedDash
          class="rule rule--right"
          axis="y"
          trigger="inView"
          :style="{ top: `${segment.top}px`, height: `${segment.height}px` }"
        />
      </template>
    </div>

    <div class="markers markers--top">
      <motion.span
        v-for="index in topMarkerCount"
        :key="index"
        class="marker"
        v-bind="markerMotion(index)"
      />
    </div>

    <div v-if="showGrid" class="grid-guides">
      <span v-for="column in 8" :key="column" class="grid-guides__col" />
    </div>
  </div>
</template>

<style scoped>
.wip-frame {
  position: absolute;
  inset: 0;
  z-index: 2;
  max-width: var(--wip-design-width);
  margin-inline: auto;
  pointer-events: none;
}

.rules {
  position: absolute;
  inset: 0;
}

.rule {
  position: absolute;
}

.rule--top {
  top: var(--wip-frame-top);
  right: 0;
  left: 0;
}

.rule--left {
  left: var(--wip-margin);
}

.rule--right {
  right: var(--wip-margin);
}

.markers--top {
  position: absolute;
  top: var(--wip-frame-top);
  right: var(--wip-margin);
  left: var(--wip-margin);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 0;
}

.marker {
  flex-shrink: 0;
  width: var(--wip-marker);
  height: var(--wip-marker);
  background: var(--wip-rule);
  transform: translateY(-50%);
  transform-origin: center center;
}

.marker:first-child {
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.marker:last-child {
  transform: translate(50%, -50%);
  transform-origin: center center;
}

.grid-guides {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(var(--wip-columns), minmax(0, 1fr));
  gap: var(--wip-gutter);
  padding-inline: var(--wip-margin);
}

.grid-guides__col {
  height: 100%;
  background: color-mix(in srgb, var(--wip-rule) 8%, transparent);
}
</style>
