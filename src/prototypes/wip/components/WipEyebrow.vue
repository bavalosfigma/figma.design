<script setup>
import WipTypeOn from './motion/WipTypeOn.vue'

defineProps({
  index: {
    type: String,
    default: '01',
  },
  label: {
    type: String,
    default: 'Introduction',
  },
  trigger: {
    type: String,
    default: 'inView',
  },
  queue: {
    type: Boolean,
    default: false,
  },
  run: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <p class="wip-eyebrow" :aria-label="`${index} ${label}`">
    <WipTypeOn
      class="wip-eyebrow__index type-editorial-caption"
      :text="index"
      :delay="0"
      :trigger="trigger"
      :queue="queue"
      :run="run"
      :ms="28"
      nowrap
    />
    <span class="wip-eyebrow__label">
      <WipTypeOn
        class="type-editorial-caption"
        :text="label"
        :delay="queue ? 0 : 0.12"
        :trigger="trigger"
        :queue="queue"
        :run="run"
        :ms="24"
        nowrap
      />
    </span>
  </p>
</template>

<style scoped>
.wip-eyebrow {
  display: flex;
  gap: 18px;
  align-items: center;
  margin: 0;
  min-height: 24px;
  color: #6b6b6b;
}

.wip-eyebrow__index {
  color: #6b6b6b;
  white-space: nowrap;
}

.wip-eyebrow__label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: #6b6b6b;
  white-space: nowrap;
  background: #c7f8fb;
}
</style>
