<script setup>
import { motion } from 'motion-v'
import { fadeMedium, softSpring } from '../motion/tokens.js'
</script>

<template>
  <motion.button
    type="button"
    class="user motion-color"
    aria-label="Account"
    :initial="{ opacity: 0, y: -8 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ opacity: fadeMedium, y: softSpring }"
    :while-hover="{ scale: 1.02 }"
    :while-tap="{ scale: 0.98 }"
  >
    <span class="avatar type-body-small">G</span>
  </motion.button>
</template>

<style scoped>
.user {
  position: absolute;
  z-index: 5;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  height: 36px;
  color: #121212;
}

.avatar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: #e4d7f6;
}
</style>
