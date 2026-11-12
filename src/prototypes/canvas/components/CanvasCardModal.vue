<script setup>
import { onMounted, onUnmounted } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { fade, springLayout } from '../motion/tokens.js'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#efefef',
  },
})

const emit = defineEmits(['close'])

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
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
        <motion.article
          class="sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :initial="{ opacity: 0, y: 28, scale: 0.98 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 16, scale: 0.98 }"
          :transition="{ opacity: fade, y: springLayout, scale: springLayout }"
          @click.stop
        >
          <div class="hero" :style="image ? undefined : { background: color }">
            <img v-if="image" class="hero-image" :src="image" alt="" />
            <button type="button" class="close" aria-label="Close" @click="emit('close')">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </button>
          </div>

          <div class="article">
            <h2 class="title type-title-medium">{{ title }}</h2>
            <p v-if="body" class="copy type-body-small-light">{{ body }}</p>
          </div>
        </motion.article>
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
  padding: 28px;
  background: rgba(255, 255, 255, 0.62);
}

.sheet {
  display: flex;
  flex-direction: column;
  width: min(880px, 100%);
  height: min(760px, 100%);
  overflow: hidden;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 24px 80px rgba(18, 18, 18, 0.16);
}

.hero {
  position: relative;
  flex: 0 0 52%;
  min-height: 240px;
  background: #efefef;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
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

.article {
  overflow: auto;
  padding: 48px 56px 64px;
}

.title {
  margin: 0;
}

.copy {
  max-width: 36rem;
  margin: 16px 0 0;
}

@media (max-width: 720px) {
  .scrim {
    padding: 12px;
  }

  .sheet {
    border-radius: 20px;
  }

  .article {
    padding: 28px 24px 36px;
  }
}
</style>
