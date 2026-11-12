<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { useDialKit } from 'dialkit/vue'
import { chromeEnter, springLayout } from '../motion/tokens.js'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const tabs = [
  { id: 'canvas', label: 'About' },
  { id: 'board', label: 'News' },
  { id: 'gallery', label: 'Gallery' },
]

const values = useDialKit('Toolbar', {
  radius: [12, 8, 48],
  height: [45, 44, 88],
  bottom: [29, 0, 80],
  background: '#ececec',
  apply: '#000000',
  duration: [0.35, 0.05, 1, 0.01],
})

const toolbarStyle = computed(() => ({
  '--toolbar-radius': `${values.value.radius}px`,
  '--toolbar-height': `${values.value.height}px`,
  '--toolbar-bottom': `${values.value.bottom}px`,
  '--toolbar-bg': values.value.background,
  '--toolbar-apply': values.value.apply,
  '--toolbar-duration': `${values.value.duration}s`,
}))

const pillX = computed(() => {
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === props.modelValue),
  )
  return index * 84
})

function choose(id) {
  emit('update:modelValue', id)
}
</script>

<template>
  <motion.div
    class="toolbar"
    :style="toolbarStyle"
    :initial="chromeEnter.initial"
    :animate="chromeEnter.animate"
    :transition="chromeEnter.transition"
  >
    <div class="tabs">
      <motion.span
        class="pill"
        :animate="{ x: pillX }"
        :transition="springLayout"
      />
      <motion.button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab type-body-small"
        :class="{ active: modelValue === tab.id }"
        :while-tap="{ scale: 0.98 }"
        :transition="springLayout"
        @click="choose(tab.id)"
      >
        {{ tab.label }}
      </motion.button>
    </div>
    <motion.button
      type="button"
      class="apply type-body-small"
      :while-tap="{ scale: 0.98 }"
      :transition="springLayout"
    >
      Apply
    </motion.button>
  </motion.div>
</template>

<style scoped>
.toolbar {
  --toolbar-inner: calc(var(--toolbar-height, 45px) - 8px);
  --toolbar-chip: calc(var(--toolbar-radius, 12px) - 4px);
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: var(--toolbar-bottom, 29px);
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--toolbar-height, 45px);
  padding: 4px;
  background: var(--toolbar-bg, #ececec);
  border-radius: var(--toolbar-radius, 12px);
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.05);
}

.tabs {
  position: relative;
  display: flex;
  gap: 4px;
  height: var(--toolbar-inner);
}

.pill {
  position: absolute;
  z-index: 0;
  left: 0;
  top: 0;
  width: 80px;
  height: var(--toolbar-inner);
  border-radius: var(--toolbar-chip);
  background: #fff;
}

.tab,
.apply {
  position: relative;
  z-index: 1;
  width: 80px;
  height: var(--toolbar-inner);
  border-radius: var(--toolbar-chip);
}

.tab {
  color: #121212;
}

.tab:not(.active) {
  opacity: 0.5;
}

.apply {
  background: var(--toolbar-apply, #000);
  color: #fff;
}
</style>
