<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { fade } from '../motion/tokens.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const copy = [
  'We’re here to build the most human, collaborative creative tools of the AI era. Our mission is to help people make work they’re proud of, together. Not good‑enough, not AI‑shrug, but the kind with your fingerprints, taste, and weird ideas.',
  'Tools should amplify imagination, not replace it. The future isn’t a chat box that does your homework; it’s a living canvas where thinking, making, and shipping collide. We’re bringing code onto the canvas, leaning into direct manipulation, and keeping creation multiplayer. Average gets automated. Great is designed.',
  'We move fast with judgment. Speed matters, but so do direction and differentiation: knowing where you’re headed and what makes it unmistakably yours. We build with our community (Config is the heartbeat), pair metrics with taste, and stay model‑agnostic. Our moat is product experience and collaboration, not fealty to any single model.',
  'Our team is thoughtful, curious, humble, and scrappy. We CMD+D and riff, celebrate the team over the hero, and take the work seriously, not ourselves. Underdog energy welcome. Bring your curiosity and rough drafts; we’ll bring the canvas, collaboration, and momentum.',
]

const paragraphs = copy.map((paragraph, paragraphIndex) => ({
  key: paragraphIndex,
  words: paragraph.split(' ').map((word, wordIndex) => ({
    key: `${paragraphIndex}-${wordIndex}`,
    text: word,
  })),
}))

const scroller = ref(null)
const wordElements = new Map()
let frame

function setWordRef(element, key) {
  if (element) wordElements.set(key, element)
  else wordElements.delete(key)
}

function updateHighlight() {
  frame = undefined
  const surface = scroller.value
  if (!surface) return

  const threshold = window.innerHeight * 0.44
  const fadeDistance = 72

  wordElements.forEach((element) => {
    const top = element.getBoundingClientRect().top
    const amount = Math.min(1, Math.max(0, (threshold - top) / fadeDistance))
    element.style.opacity = `${0.1 + amount * 0.9}`
  })
}

function scheduleHighlight() {
  if (frame) return
  frame = requestAnimationFrame(updateHighlight)
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    await nextTick()
    if (scroller.value) scroller.value.scrollTop = 0
    updateHighlight()
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', scheduleHighlight)
})

onUnmounted(() => {
  if (frame) cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', scheduleHighlight)
})
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        ref="scroller"
        class="mission-takeover"
        role="dialog"
        aria-modal="true"
        aria-label="Mission"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="fade"
        @scroll="scheduleHighlight"
      >
        <button type="button" class="close" aria-label="Close" @click="emit('close')">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>

        <main class="mission-copy type-display-large">
          <p v-for="paragraph in paragraphs" :key="paragraph.key">
            <template v-for="word in paragraph.words" :key="word.key">
              <span
                :ref="(element) => setWordRef(element, word.key)"
                class="word"
              >{{ `${word.text} ` }}</span>
            </template>
          </p>
        </main>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
.mission-takeover {
  position: fixed;
  z-index: 50;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: #fafd5d;
  scrollbar-width: none;
}

.mission-takeover::-webkit-scrollbar {
  display: none;
}

.mission-copy {
  width: calc(100% - 96px);
  max-width: 1000px;
  margin: 0 auto;
  padding: 56vh 0 62vh;
  overflow-wrap: anywhere;
  color: #000;
}

.mission-copy p {
  margin: 0 0 0.85em;
}

.word {
  opacity: 0.1;
  white-space: pre-wrap;
  will-change: opacity;
}

.close {
  position: fixed;
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

@media (max-width: 800px) {
  .mission-copy {
    width: calc(100% - 40px);
    font-size: clamp(32px, 8vw, 62px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .word {
    will-change: auto;
  }
}
</style>
