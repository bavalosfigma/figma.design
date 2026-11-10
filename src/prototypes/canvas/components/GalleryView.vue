<script setup>
import { motion } from 'motion-v'
import PanStage from './PanStage.vue'
import { galleryItems } from '../data/items.js'
import { softSpring } from '../motion/tokens.js'

function place(item) {
  return {
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: `${item.w}px`,
  }
}
</script>

<template>
  <PanStage>
    <motion.figure
      v-for="item in galleryItems"
      :key="item.id"
      class="shot group"
      :class="{ overlay: item.overlay }"
      :style="place(item)"
      :while-hover="{ scale: 1.02 }"
      :transition="softSpring"
    >
      <div class="media" :style="{ height: `${item.h}px` }" />
      <figcaption
        :class="item.overlay ? 'type-body-small' : 'type-editorial-caption'"
      >
        {{ item.label }}
      </figcaption>
    </motion.figure>
  </PanStage>
</template>

<style scoped>
.shot {
  position: absolute;
  margin: 0;
  pointer-events: auto;
  transform-origin: center center;
}

.media {
  background: #d4d4d4;
}

figcaption {
  margin-top: 8px;
  color: #6b6b6b;
}

.overlay figcaption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  margin: 0;
  padding: 4px 12px;
  border-radius: 999px;
  background: #f2f2f2;
  color: #121212;
}

@media (prefers-reduced-motion: reduce) {
  .shot {
    transform: none !important;
  }
}
</style>
