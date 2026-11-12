<script setup>
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
  <div class="wip-frame" aria-hidden="true">
    <div class="rules">
      <WipAnimatedDash class="rule rule--top" axis="x" trigger="mount" :delay="0" />
      <WipAnimatedDash class="rule rule--left" axis="y" trigger="mount" :delay="0.16" />
      <WipAnimatedDash class="rule rule--right" axis="y" trigger="mount" :delay="0.16" />
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
      <span v-for="column in 6" :key="column" class="grid-guides__col" />
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
  top: 0;
  bottom: 0;
  left: var(--wip-margin);
}

.rule--right {
  top: 0;
  right: var(--wip-margin);
  bottom: 0;
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
  background: rgba(0, 0, 0, 0.035);
}
</style>
