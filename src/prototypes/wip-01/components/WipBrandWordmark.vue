<script setup>
import { computed, ref } from 'vue'
import { WIP_MARK_SCALE, brandOutlines } from '../data/brandOutlines.js'
import {
  isWipSegmentSelected,
  nudgeWipBrandPathPoint,
  selectWipBrandSegment,
  wipHandlesForLayout,
  wipPathD,
  wipPathsForLayout,
} from '../composables/useWipBrandPathState.js'
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
  scale: {
    type: Number,
    default: WIP_MARK_SCALE,
  },
  letterPoses: {
    type: Array,
    default: null,
  },
  fill: {
    type: String,
    default: '',
  },
})

const svgRef = ref(null)
const SELECT_STROKE = '#b4b4b4'
const HANDLE_SIZE = 2
const HANDLE_HALF = HANDLE_SIZE / 2
const HIT_SIZE = 10
const HIT_HALF = HIT_SIZE / 2

const meta = computed(() => brandOutlines[props.layoutId])
const paths = computed(() => wipPathsForLayout(props.layoutId))

const svgProps = computed(() => {
  const entry = meta.value
  if (!entry) return null
  return {
    width: entry.width * props.scale,
    height: entry.height * props.scale,
    viewBox: entry.viewBox,
  }
})

const editHandles = computed(() => wipHandlesForLayout(props.layoutId))

function handlesFor(pathIndex) {
  return editHandles.value.filter((handle) => handle.pathIndex === pathIndex)
}

function letterStyle(index) {
  const pose = props.letterPoses?.[index]
  if (!pose) return undefined
  return {
    opacity: pose.opacity,
    transform: `translateY(${pose.y}px) rotate(${pose.rotate}deg)`,
  }
}

function pathStroke(path) {
  return isWipSegmentSelected(props.layoutId, path.segment) ? '#0d99ff' : SELECT_STROKE
}

function onPathPointerDown(path, event) {
  event.stopPropagation()
  selectWipBrandSegment(props.layoutId, path.segment)
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
    nudgeWipBrandPathPoint(props.layoutId, handle.pathIndex, handle.commandIndex, dx, dy)
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
  <div
    v-if="svgProps"
    class="wip-wordmark"
    :aria-label="text || undefined"
    role="img"
  >
    <svg
      ref="svgRef"
      class="wip-wordmark__svg"
      :width="svgProps.width"
      :height="svgProps.height"
      :viewBox="svgProps.viewBox"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        v-for="(path, index) in paths"
        :key="index"
        class="wip-wordmark__letter"
        :style="letterStyle(index)"
      >
        <path
          class="wip-wordmark__path"
          :class="{
            'wip-wordmark__path--active': isWipSegmentSelected(layoutId, path.segment),
          }"
          :d="wipPathD(path)"
          :fill="fill || path.fill"
          :stroke="pathStroke(path)"
          stroke-width="1.25"
          stroke-linejoin="round"
          stroke-linecap="round"
          vector-effect="non-scaling-stroke"
          @pointerdown="onPathPointerDown(path, $event)"
        />
        <g v-if="handlesFor(index).length" class="wip-wordmark__handles">
          <g
            v-for="(handle, handleIndex) in handlesFor(index)"
            :key="`${handle.pathIndex}-${handle.commandIndex}-${handleIndex}`"
            class="wip-wordmark__handle"
            @pointerdown="onHandlePointerDown(handle, $event)"
          >
            <rect
              class="wip-wordmark__handle-hit"
              :x="handle.x - HIT_HALF"
              :y="handle.y - HIT_HALF"
              :width="HIT_SIZE"
              :height="HIT_SIZE"
            />
            <rect
              class="wip-wordmark__handle-dot"
              :x="handle.x - HANDLE_HALF"
              :y="handle.y - HANDLE_HALF"
              :width="HANDLE_SIZE"
              :height="HANDLE_SIZE"
            />
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.wip-wordmark {
  position: relative;
  z-index: 2;
  line-height: 0;
  pointer-events: auto;
  touch-action: none;
}

.wip-wordmark__svg {
  display: block;
  overflow: visible;
}

.wip-wordmark__letter {
  transform-box: fill-box;
  transform-origin: center bottom;
}

.wip-wordmark__path {
  pointer-events: visiblePainted;
  cursor: pointer;
}

.wip-wordmark__handles {
  pointer-events: none;
}

.wip-wordmark__handle {
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}

.wip-wordmark__handle:active {
  cursor: grabbing;
}

.wip-wordmark__handle-hit {
  fill: transparent;
}

.wip-wordmark__handle-dot {
  fill: #fff;
  stroke: #0d99ff;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
</style>
