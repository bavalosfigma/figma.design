<script setup>
import { computed, ref } from 'vue'
import { motion } from 'motion-v'
import { springLayout } from '../motion/tokens.js'
import { BRAND_MARK_SCALE, brandOutlines } from '../data/brandOutlines.js'
import {
  handlesForSelection,
  isSegmentSelected,
  nudgeBrandPathPoint,
  pathD,
  pathsForLayout,
  selectBrandSegment,
} from '../composables/useBrandPathState.js'
import { clientDeltaToSvg } from '../utils/svgPath.js'

const props = defineProps({
  layoutId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  canvas: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
})

const layoutTransition = { layout: springLayout }
const svgRef = ref(null)
const POINT = '#0d99ff'
const POINT_R = 3.4
const HIT_R = 7

const meta = computed(() => brandOutlines[props.layoutId])

const paths = computed(() => pathsForLayout(props.layoutId))

const svgProps = computed(() => {
  const entry = meta.value
  if (!entry) return null
  return {
    width: entry.width * BRAND_MARK_SCALE,
    height: entry.height * BRAND_MARK_SCALE,
    viewBox: entry.viewBox,
  }
})

const editHandles = computed(() => {
  if (!props.editable) return []
  return handlesForSelection(props.layoutId)
})

function onPathPointerDown(path, event) {
  if (!props.editable) return
  event.stopPropagation()
  selectBrandSegment(props.layoutId, path.segment)
}

function onHandlePointerDown(handle, event) {
  event.stopPropagation()
  event.preventDefault()

  const pointerId = event.pointerId
  const target = event.currentTarget
  let lastX = event.clientX
  let lastY = event.clientY

  target?.setPointerCapture?.(pointerId)

  function onMove(ev) {
    if (ev.pointerId !== pointerId) return
    const dxClient = ev.clientX - lastX
    const dyClient = ev.clientY - lastY
    lastX = ev.clientX
    lastY = ev.clientY

    const { dx, dy } = clientDeltaToSvg(svgRef.value, dxClient, dyClient)
    nudgeBrandPathPoint(props.layoutId, handle.pathIndex, handle.commandIndex, dx, dy)
  }

  function onUp(ev) {
    if (ev.pointerId !== pointerId) return
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    try {
      target?.releasePointerCapture?.(pointerId)
    } catch {
      /* already released */
    }
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}
</script>

<template>
  <motion.div
    v-if="svgProps"
    :layout-id="layoutId"
    layout
    class="wordmark-root"
    :class="{
      'wordmark-root-canvas': canvas,
      'wordmark-root-editable': editable,
    }"
    :style="canvas ? { left: `${x}px`, top: `${y}px` } : undefined"
    :transition="layoutTransition"
    :aria-label="text || undefined"
    role="img"
  >
    <svg
      ref="svgRef"
      class="wordmark-svg"
      :width="svgProps.width"
      :height="svgProps.height"
      :viewBox="svgProps.viewBox"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        v-for="(path, index) in paths"
        :key="index"
        class="wordmark-path"
        :class="{
          'wordmark-path-active': editable && isSegmentSelected(layoutId, path.segment),
        }"
        :d="pathD(path)"
        :fill="path.fill"
        :stroke="editable && isSegmentSelected(layoutId, path.segment) ? POINT : 'none'"
        stroke-width="1.25"
        stroke-linejoin="round"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
        @pointerdown="onPathPointerDown(path, $event)"
      />
      <g v-if="editHandles.length" class="handles">
        <g
          v-for="(handle, index) in editHandles"
          :key="`${handle.pathIndex}-${handle.commandIndex}-${index}`"
          class="handle"
          @pointerdown="onHandlePointerDown(handle, $event)"
        >
          <circle class="handle-hit" :cx="handle.x" :cy="handle.y" :r="HIT_R" />
          <circle class="handle-dot" :cx="handle.x" :cy="handle.y" :r="POINT_R" />
        </g>
      </g>
    </svg>
  </motion.div>
</template>

<style scoped>
.wordmark-root {
  position: relative;
  z-index: 2;
  line-height: 0;
}

.wordmark-root-canvas {
  position: absolute;
}

.wordmark-root-editable {
  pointer-events: auto;
  touch-action: none;
}

.wordmark-svg {
  display: block;
  overflow: visible;
}

.wordmark-path {
  pointer-events: visiblePainted;
}

.wordmark-root-editable .wordmark-path {
  cursor: pointer;
}

.handles {
  pointer-events: none;
}

.handle {
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}

.handle:active {
  cursor: grabbing;
}

.handle-hit {
  fill: transparent;
}

.handle-dot {
  fill: #fff;
  stroke: #0d99ff;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}
</style>
