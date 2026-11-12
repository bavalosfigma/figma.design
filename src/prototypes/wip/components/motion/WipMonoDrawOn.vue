<script setup>
import WipTypeOn from './WipTypeOn.vue'

defineProps({
  text: { type: String, required: true },
  delay: { type: Number, default: 0 },
  trigger: {
    type: String,
    default: 'inView',
  },
  stagger: { type: Number, default: 0.026 },
  queue: { type: Boolean, default: false },
  run: { type: Boolean, default: true },
})
</script>

<template>
  <WipTypeOn
    class="type-editorial-caption"
    :text="text"
    :delay="delay"
    :trigger="trigger"
    :ms="Math.round(stagger * 1000)"
    :queue="queue"
    :run="run"
    nowrap
  />
</template>
