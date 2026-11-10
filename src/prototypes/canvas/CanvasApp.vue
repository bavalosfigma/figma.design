<script setup>
import { ref } from 'vue'
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion-v'
import Toolbar from './components/Toolbar.vue'
import UserChip from './components/UserChip.vue'
import CanvasView from './components/CanvasView.vue'
import BoardView from './components/BoardView.vue'
import GalleryView from './components/GalleryView.vue'
import { spring, viewMotion } from './motion/tokens.js'
import './styles/motion.css'

const mode = ref('canvas')

const views = {
  canvas: CanvasView,
  board: BoardView,
  gallery: GalleryView,
}
</script>

<template>
  <LayoutGroup id="canvas-prototype">
    <MotionConfig :transition="spring">
      <div class="canvas-app">
        <AnimatePresence mode="popLayout">
          <motion.div
            v-if="views[mode]"
            :key="mode"
            class="view"
            :initial="viewMotion.initial"
            :animate="viewMotion.animate"
            :exit="viewMotion.exit"
            :transition="viewMotion.transition"
          >
            <component :is="views[mode]" />
          </motion.div>
        </AnimatePresence>
        <UserChip />
        <Toolbar v-model="mode" />
      </div>
    </MotionConfig>
  </LayoutGroup>
</template>

<style scoped>
.canvas-app {
  position: relative;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.view {
  position: absolute;
  inset: 0;
}
</style>
