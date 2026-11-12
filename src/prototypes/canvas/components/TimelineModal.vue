<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { AnimatePresence, animate, motion } from 'motion-v'
import { fade, springLayout } from '../motion/tokens.js'
import galleryCenter from '../assets/gallery/center.jpg'
import galleryLeft from '../assets/gallery/left.png'
import galleryRight from '../assets/gallery/right.png'

const START_YEAR = 2012
const END_YEAR = new Date().getFullYear()
const YEAR_GAP = 96
const DRAG_THRESHOLD = 5
const images = [galleryCenter, galleryLeft, galleryRight]

const CAPTIONS = [
  'Lorem ipsum dolor sit amet consectetur. Malesuada purus quam pulvinar tellus porttitor dui mollis scelerisque. Ornare convallis bibendum sagittis magna lacus tristique. Hendrerit a enim suscipit dignissim.',
  'Aenean commodo ligula eget dolor aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus mus. Donec quam felis ultricies nec pellentesque eu pretium quis sem.',
  'Praesent vestibulum dapibus nibh etiam ultricies. Nisi vel augue curabitur ullamcorper ultricies nisi nam eget dui. Etiam rhoncus maecenas tempus tellus eget condimentum rhoncus sem quam.',
]

const FRONT_W = 750
const FRONT_H = 500
const STACK_SCALE = 663 / FRONT_W
const EXIT_SCALE = 1.05
// Stack scale per slot, continued past the resting image. 105% is a short
// scroll later, and the image stays opaque until then.
const EXIT_AT = -((EXIT_SCALE - 1) / (1 - STACK_SCALE))
const FADE = 0.06

function scaledFront(at) {
  const scale = 1 - (1 - STACK_SCALE) * at
  const width = FRONT_W * scale
  const height = FRONT_H * scale
  return {
    at,
    top: (FRONT_H - height) / 2,
    width,
    height,
    radius: 24 * scale,
    opacity: 1,
    shadow: 0.1,
  }
}

const exitPose = scaledFront(EXIT_AT)

const POSES = [
  { ...exitPose, at: -1, opacity: 0, shadow: 0 },
  exitPose,
  scaledFront(0),
  { at: 1, top: -18, width: 663, height: 442, radius: 21, opacity: 1, shadow: 0 },
  { at: 2, top: -34, width: 564, height: 376, radius: 21, opacity: 1, shadow: 0 },
  { at: 3, top: -62, width: 480, height: 320, radius: 21, opacity: 0, shadow: 0 },
]

const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, index) => START_YEAR + index)

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const viewH = ref(0)
const y = ref(0)
const panning = ref(false)
const reducedMotion = ref(false)

const progress = computed(() => {
  if (!viewH.value) return 0
  const value = (viewH.value / 2 - y.value) / YEAR_GAP - 0.5
  return Math.min(years.length - 1, Math.max(0, value))
})

const activeIndex = computed(() => Math.round(progress.value))

const activeYear = computed(() => years[activeIndex.value] ?? START_YEAR)

const caption = computed(() => CAPTIONS[activeIndex.value % CAPTIONS.length])

const cards = computed(() =>
  years.map((year, index) => ({
    year,
    image: images[index % images.length],
    style: cardStyle(index - progress.value),
  })),
)

let userHasPanned = false
let stopDrag = () => {}
let media
let snapControls
let wheelTimer

function offsetFor(yearIndex, height = viewH.value) {
  return height / 2 - (yearIndex + 0.5) * YEAR_GAP
}

function clampOffset(offset, height = viewH.value) {
  const max = offsetFor(0, height)
  const min = offsetFor(years.length - 1, height)
  return Math.min(max, Math.max(min, offset))
}

function mix(a, b, t) {
  return a + (b - a) * t
}

function popOpacity(slot) {
  const gone = EXIT_AT - FADE
  if (slot <= gone || slot >= 2 + FADE) return 0
  if (slot < EXIT_AT) return (slot - gone) / FADE
  if (slot > 2) return (2 + FADE - slot) / FADE
  return 1
}

function cardStyle(slot) {
  if (slot <= -1 || slot >= 3) {
    return { opacity: 0, visibility: 'hidden' }
  }
  let pose = 0
  while (pose < POSES.length - 2 && slot > POSES[pose + 1].at) pose += 1
  const from = POSES[pose]
  const to = POSES[pose + 1]
  const t = (slot - from.at) / (to.at - from.at)
  const shadow = mix(from.shadow, to.shadow, t)
  const opacity = popOpacity(slot)
  return {
    top: `${mix(from.top, to.top, t)}px`,
    width: `${mix(from.width, to.width, t)}px`,
    height: `${mix(from.height, to.height, t)}px`,
    borderRadius: `${mix(from.radius, to.radius, t)}px`,
    opacity,
    zIndex: slot < 0.05 ? 5 : Math.round(4 - slot),
    boxShadow: shadow > 0.01 ? `0 4px 14px rgba(0, 0, 0, ${shadow})` : 'none',
    visibility: opacity === 0 ? 'hidden' : 'visible',
  }
}

function stopSnap() {
  snapControls?.stop()
  snapControls = undefined
  clearTimeout(wheelTimer)
}

function nearestOffset(value = y.value) {
  if (!viewH.value) return value
  const raw = (viewH.value / 2 - value) / YEAR_GAP - 0.5
  const index = Math.min(years.length - 1, Math.max(0, Math.round(raw)))
  return offsetFor(index)
}

function springTo(target) {
  stopSnap()
  const next = clampOffset(target)
  if (reducedMotion.value || Math.abs(next - y.value) < 0.5) {
    y.value = next
    return
  }
  snapControls = animate(y.value, next, {
    ...springLayout,
    onUpdate: (value) => {
      y.value = value
    },
  })
}

function layout(reset) {
  const height = window.innerHeight
  const current = viewH.value ? progress.value : 0
  viewH.value = height
  y.value = offsetFor(reset || !userHasPanned ? 0 : current, height)
}

function onWheel(event) {
  if (!props.open) return
  event.preventDefault()
  stopSnap()
  userHasPanned = true
  const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  y.value = clampOffset(y.value - delta)
  wheelTimer = setTimeout(() => springTo(nearestOffset()), 120)
}

function onPointerDown(event) {
  if (event.button !== 0) return
  const surface = event.currentTarget
  const pointerId = event.pointerId
  const startY = event.clientY
  const originY = y.value
  let dragging = false
  stopSnap()

  function onMove(ev) {
    if (ev.pointerId !== pointerId) return
    const dy = ev.clientY - startY
    if (!dragging) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return
      dragging = true
      userHasPanned = true
      panning.value = true
      surface.setPointerCapture(pointerId)
    }
    y.value = clampOffset(originY + dy)
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
    springTo(nearestOffset())
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

function chooseYear(index) {
  userHasPanned = true
  springTo(offsetFor(index))
}

function step(delta) {
  const next = Math.min(years.length - 1, Math.max(0, Math.round(progress.value) + delta))
  userHasPanned = true
  springTo(offsetFor(next))
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
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
    viewH.value = window.innerHeight
    y.value = offsetFor(0)
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
        :class="{ 'is-panning': panning }"
        role="dialog"
        aria-modal="true"
        aria-label="History of Figma"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="fade"
        @pointerdown="onPointerDown"
      >
        <button type="button" class="close" aria-label="Close" @pointerdown.stop @click="emit('close')">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>

        <p class="live" aria-live="polite">{{ activeYear }}</p>

        <div class="timeline">
          <div class="track">
            <button
              v-for="(year, index) in years"
              :key="year"
              type="button"
              class="tick"
              :class="{ active: year === activeYear }"
              @pointerdown.stop
              @click="chooseYear(index)"
            >
              <span class="year">{{ year }}</span>
              <span class="notch" />
            </button>
          </div>
        </div>

        <div class="deck">
          <div v-for="card in cards" :key="card.year" class="card" :style="card.style">
            <img :src="card.image" alt="" draggable="false" />
          </div>
          <p class="caption type-body-small">{{ caption }}</p>
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
  background: #e4ff97;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.scrim.is-panning {
  cursor: grabbing;
}

.live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.timeline {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
}

.track {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: min(999px, calc(100% - 96px));
}

.tick {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #000;
  opacity: 0.2;
  cursor: pointer;
}

.tick.active {
  opacity: 1;
}

.year {
  font-family: 'Figma Sans VF', sans-serif;
  font-weight: 400;
  font-size: 16px;
  font-variation-settings: 'wdth' 100;
  line-height: 0.9;
  letter-spacing: -0.16px;
}

.notch {
  width: 1px;
  height: 10px;
  margin-top: 28px;
  background: currentColor;
}

.tick.active .notch {
  height: 19px;
  margin-top: 19px;
}

.deck {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 750px;
  height: 500px;
  transform: translate(-50%, calc(-50% - 48px));
  pointer-events: none;
}

.card {
  position: absolute;
  left: 50%;
  background: #c4c4c4;
  transform: translateX(-50%);
}

.card img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.caption {
  position: absolute;
  top: calc(100% + 16px);
  right: 0;
  left: 0;
  margin: 0;
  color: #000;
  text-align: left;
}

.close {
  position: absolute;
  z-index: 4;
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
  cursor: pointer;
}

.close:hover {
  background: #f4f4f4;
}
</style>
