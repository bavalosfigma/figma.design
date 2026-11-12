<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { fade, springLayout } from '../motion/tokens.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Video',
  },
  src: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const video = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = 60
let frame
let previousTime

function stopVideo() {
  const element = video.value
  if (!element) return
  element.pause()
  element.currentTime = 0
}

async function playVideo() {
  await nextTick()
  const element = video.value
  if (!props.open || !element) return
  element.currentTime = 0
  try {
    await element.play()
  } catch {
    if (!props.open || video.value !== element) return
    element.muted = true
    try {
      await element.play()
    } catch {
      // The browser blocked autoplay.
    }
  }
}

function formatTime(value) {
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function tick(time) {
  if (!playing.value) return
  if (previousTime === undefined) previousTime = time
  currentTime.value = Math.min(duration, currentTime.value + (time - previousTime) / 1000)
  previousTime = time

  if (currentTime.value >= duration) {
    playing.value = false
    currentTime.value = 0
    previousTime = undefined
    return
  }

  frame = requestAnimationFrame(tick)
}

function togglePlayback() {
  playing.value = !playing.value
  previousTime = undefined
  if (playing.value) frame = requestAnimationFrame(tick)
  else if (frame) cancelAnimationFrame(frame)
}

function seek(event) {
  currentTime.value = Number(event.target.value)
  previousTime = undefined
}

function close() {
  stopVideo()
  playing.value = false
  if (frame) cancelAnimationFrame(frame)
  emit('close')
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') close()
  if (event.key === ' ' && !props.src) {
    event.preventDefault()
    togglePlayback()
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      playVideo()
      return
    }
    stopVideo()
    playing.value = false
    currentTime.value = 0
    previousTime = undefined
    if (frame) cancelAnimationFrame(frame)
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  if (frame) cancelAnimationFrame(frame)
  window.removeEventListener('keydown', onKeydown)
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
        @click.self="close"
      >
        <button type="button" class="close" aria-label="Close" @click="close">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>

        <motion.div
          class="player"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :initial="{ opacity: 0, y: 60, scale: 1.04 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 32, scale: 1.02 }"
          :transition="{ opacity: fade, y: springLayout, scale: springLayout }"
        >
          <video
            v-if="src"
            ref="video"
            class="video"
            :src="src"
            autoplay
            controls
            playsinline
          />

          <div v-else class="placeholder" :class="{ playing }">
            <button
              type="button"
              class="center-control"
              :aria-label="playing ? 'Pause video' : 'Play video'"
              @click="togglePlayback"
            >
              <svg v-if="!playing" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                <path d="M10 6 L24 15 L10 24 Z" fill="currentColor" />
              </svg>
              <svg v-else width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                <path d="M9 7 H13 V23 H9 Z M17 7 H21 V23 H17 Z" fill="currentColor" />
              </svg>
            </button>

            <div class="controls">
              <button
                type="button"
                class="play-control"
                :aria-label="playing ? 'Pause video' : 'Play video'"
                @click="togglePlayback"
              >
                {{ playing ? 'Pause' : 'Play' }}
              </button>
              <input
                class="progress"
                type="range"
                min="0"
                :max="duration"
                step="0.1"
                :value="currentTime"
                aria-label="Video progress"
                @input="seek"
              />
              <span class="time type-label-xsmall">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
.scrim {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 72px 48px;
  background: #fff;
}

.player {
  position: relative;
  width: min(1200px, 100%, calc((100vh - 144px) * 16 / 9));
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 24px;
  background: #bdbdbd;
}

.video,
.placeholder {
  width: 100%;
  height: 100%;
}

.video {
  display: block;
  object-fit: contain;
  background: #bdbdbd;
}

.placeholder {
  position: relative;
  background: #bdbdbd;
}

.placeholder.playing {
  background: #b7b7b7;
}

.center-control {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
}

.controls {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
}

.play-control {
  min-width: 42px;
  color: #fff;
  font: inherit;
}

.progress {
  flex: 1;
  accent-color: #fff;
}

.time {
  flex: 0 0 auto;
  color: #fff;
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

@media (max-width: 700px) {
  .scrim {
    padding: 72px 20px;
  }

  .player {
    border-radius: 16px;
  }

  .time {
    display: none;
  }
}
</style>
