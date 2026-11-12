<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { AnimatePresence, animate, motion } from 'motion-v'
import { fade, softSpring, springLayout } from '../motion/tokens.js'
import { canvasPlaceFrom, canvasPlaceTo, canvasPlaceTransition } from '../motion/fall.js'

const PHOTO_W = 750
const SIDE_W = 375
const GAP = 48
const PITCH = PHOTO_W + GAP
const DRAG_THRESHOLD = 5

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  slides: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close'])

const viewport = ref(null)
const x = ref(0)
const viewW = ref(0)
const repeats = ref(3)
const panning = ref(false)
const reducedMotion = ref(false)

const count = computed(() => props.slides.length)
const setWidth = computed(() => count.value * PITCH)
const middleIndex = computed(() => Math.floor(repeats.value / 2) * count.value)

const hover = { scale: 1.02, transition: softSpring }

const strip = computed(() => {
  const items = []
  const center = Math.floor(repeats.value / 2) * props.slides.length
  for (let copy = 0; copy < repeats.value; copy += 1) {
    props.slides.forEach((slide, slideIndex) => {
      const index = items.length
      const distance = Math.abs(index - center)
      items.push({
        key: `${copy}-${slideIndex}`,
        image: slide.image,
        motion: reducedMotion.value
          ? { initial: false, animate: canvasPlaceTo }
          : {
              initial: canvasPlaceFrom,
              animate: canvasPlaceTo,
              transition: canvasPlaceTransition(distance, reducedMotion.value),
            },
      })
    })
  }
  return items
})

let userHasPanned = false
let stopDrag = () => {}
let media
let snapControls
let wheelTimer

function stopSnap() {
  snapControls?.stop()
  snapControls = undefined
  clearTimeout(wheelTimer)
}

function nearestX(value = x.value) {
  const origin = baseX()
  const steps = Math.round((value - origin) / PITCH)
  return origin + steps * PITCH
}

function springTo(target) {
  stopSnap()
  if (reducedMotion.value || Math.abs(target - x.value) < 0.5) {
    x.value = target
    wrap()
    return
  }
  snapControls = animate(x.value, target, {
    ...springLayout,
    onUpdate: (value) => {
      x.value = value
    },
    onComplete: () => wrap(),
  })
}

function baseX(width = viewW.value) {
  return width / 2 - PHOTO_W / 2 - middleIndex.value * PITCH
}

function wrap() {
  const span = setWidth.value
  if (!span) return
  const origin = baseX()
  let next = x.value
  while (next > origin + span) next -= span
  while (next < origin - span) next += span
  x.value = next
}

function layout(reset) {
  const width = viewport.value?.clientWidth || window.innerWidth
  viewW.value = width
  const span = setWidth.value
  if (!span) return
  const needed = Math.max(3, Math.ceil((width + span * 2) / span) + 1)
  if (needed !== repeats.value) repeats.value = needed
  if (reset || !userHasPanned) x.value = baseX(width)
  else wrap()
}

function widthFor(index) {
  const itemCenter = x.value + index * PITCH + PHOTO_W / 2
  const dist = Math.abs(itemCenter - viewW.value / 2)
  const t = Math.max(0, 1 - dist / PITCH)
  return SIDE_W + (PHOTO_W - SIDE_W) * t
}

function onWheel(event) {
  if (!props.open) return
  event.preventDefault()
  stopSnap()
  userHasPanned = true
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  x.value -= delta
  wrap()
  wheelTimer = setTimeout(() => springTo(nearestX()), 120)
}

function onPointerDown(event) {
  if (event.button !== 0) return
  const surface = event.currentTarget
  const pointerId = event.pointerId
  const startX = event.clientX
  const originX = x.value
  let dragging = false
  stopSnap()

  function onMove(ev) {
    if (ev.pointerId !== pointerId) return
    const dx = ev.clientX - startX
    if (!dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return
      dragging = true
      userHasPanned = true
      panning.value = true
      surface.setPointerCapture(pointerId)
    }
    x.value = originX + dx
    wrap()
  }

  function onUp(ev) {
    if (ev.pointerId !== pointerId) return
    if (dragging) {
      try {
        surface.releasePointerCapture(pointerId)
      } catch {
        /* already released */
      }
    }
    panning.value = false
    springTo(nearestX())
    surface.removeEventListener('pointermove', onMove)
    surface.removeEventListener('pointerup', onUp)
    surface.removeEventListener('pointercancel', onUp)
    stopDrag = () => {}
  }

  stopDrag = () => {
    surface.removeEventListener('pointermove', onMove)
    surface.removeEventListener('pointerup', onUp)
    surface.removeEventListener('pointercancel', onUp)
    panning.value = false
  }

  surface.addEventListener('pointermove', onMove)
  surface.addEventListener('pointerup', onUp)
  surface.addEventListener('pointercancel', onUp)
}

function step(delta) {
  if (count.value < 2) return
  userHasPanned = true
  springTo(nearestX() - delta * PITCH)
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  }
}

function onMotionPreference(event) {
  reducedMotion.value = event.matches
}

function onResize() {
  if (props.open) layout(false)
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    userHasPanned = false
    const width = window.innerWidth
    viewW.value = width
    const span = count.value * PITCH
    if (!span) return
    const needed = Math.max(3, Math.ceil((width + span * 2) / span) + 1)
    repeats.value = needed
    x.value = width / 2 - PHOTO_W / 2 - Math.floor(needed / 2) * count.value * PITCH
  },
)

onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = media.matches
  media.addEventListener('change', onMotionPreference)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
  window.addEventListener('wheel', onWheel, { passive: false })
})

onUnmounted(() => {
  stopDrag()
  stopSnap()
  media?.removeEventListener('change', onMotionPreference)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('wheel', onWheel)
})
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        class="scrim"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="fade"
        @click.self="emit('close')"
      >
        <button type="button" class="close" aria-label="Close" @click="emit('close')">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>

        <div
          ref="viewport"
          class="viewport"
          :class="{ 'is-panning': panning }"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Image carousel'"
          @pointerdown="onPointerDown"
        >
          <div class="track" :style="{ transform: `translate3d(${x}px, 0, 0)` }">
            <div v-for="(item, index) in strip" :key="item.key" class="slot">
              <motion.img
                class="photo"
                :src="item.image"
                alt=""
                draggable="false"
                :style="{ width: `${widthFor(index)}px` }"
                v-bind="item.motion"
                :while-hover="hover"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
.scrim {
  position: fixed;
  z-index: 50;
  inset: 0;
  overflow: hidden;
  background: #fff;
}

.viewport {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 500px;
  transform: translateY(-50%);
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.viewport.is-panning {
  cursor: grabbing;
}

.track {
  display: flex;
  align-items: center;
  gap: 48px;
  height: 500px;
  will-change: transform;
}

.slot {
  display: grid;
  flex: 0 0 750px;
  place-items: center;
  width: 750px;
  height: 500px;
}

.photo {
  height: 500px;
  border-radius: 24px;
  object-fit: cover;
}

.close {
  position: absolute;
  z-index: 2;
  top: 20px;
  right: 20px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  color: #121212;
  box-shadow: 0 1px 4px rgba(18, 18, 18, 0.16);
}

.close:hover {
  background: #f4f4f4;
}
</style>
