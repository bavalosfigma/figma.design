<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { claimWipTypeDelay } from '../../composables/useWipTypeQueue.js'

const props = defineProps({
  text: { type: String, required: true },
  delay: { type: Number, default: 0 },
  trigger: {
    type: String,
    default: 'inView',
    validator: (value) => value === 'mount' || value === 'inView',
  },
  /** Milliseconds between characters */
  ms: { type: Number, default: 18 },
  as: { type: String, default: 'span' },
  queue: { type: Boolean, default: false },
  nowrap: { type: Boolean, default: false },
  /** When false, wait until it becomes true before typing */
  run: { type: Boolean, default: true },
})

const el = ref(null)
const count = ref(0)
const done = ref(false)
const started = ref(false)

const reduceMotion = ref(false)
if (typeof window !== 'undefined') {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const glyphs = computed(() => [...props.text])
const visible = computed(() => glyphs.value.slice(0, count.value).join(''))

const startDelaySec = props.queue ? claimWipTypeDelay(glyphs.value.length, props.ms) : props.delay

let timer
let observer

function finish() {
  count.value = glyphs.value.length
  done.value = true
}

function tick() {
  if (count.value >= glyphs.value.length) {
    finish()
    return
  }
  count.value += 1
  timer = window.setTimeout(tick, props.ms)
}

function start() {
  if (started.value) return
  started.value = true

  if (reduceMotion.value) {
    finish()
    return
  }

  count.value = 0
  timer = window.setTimeout(tick, Math.max(0, startDelaySec * 1000))
}

function observe() {
  if (observer || !el.value) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        start()
        observer?.disconnect()
      }
    },
    { threshold: 0, rootMargin: '0px 0px -8% 0px' },
  )
  observer.observe(el.value)
}

function arm() {
  if (!props.run) return
  if (props.trigger === 'mount' || reduceMotion.value) start()
  else observe()
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  arm()
})

watch(
  () => props.run,
  (value) => {
    if (value) arm()
  },
)

watch(
  () => props.text,
  () => {
    if (done.value || reduceMotion.value) {
      count.value = glyphs.value.length
    }
  },
)

onBeforeUnmount(() => {
  window.clearTimeout(timer)
  observer?.disconnect()
})
</script>

<template>
  <component
    :is="as"
    ref="el"
    class="wip-type-on"
    :class="{ 'wip-type-on--nowrap': nowrap }"
    :aria-label="text"
  >
    <span class="wip-type-on__sizer" aria-hidden="true">{{ text }}</span>
    <span class="wip-type-on__live" aria-hidden="true">{{ visible }}</span>
  </component>
</template>

<style scoped>
.wip-type-on {
  position: relative;
  display: inline-block;
  max-width: 100%;
  white-space: pre-wrap;
}

.wip-type-on--nowrap {
  white-space: nowrap;
}

.wip-type-on__sizer {
  visibility: hidden;
}

.wip-type-on__live {
  position: absolute;
  inset: 0;
  pointer-events: none;
  white-space: inherit;
}
</style>
