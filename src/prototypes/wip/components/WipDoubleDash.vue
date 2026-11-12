<script setup>
import WipAnimatedDash from './motion/WipAnimatedDash.vue'
</script>

<template>
  <div class="wip-double-dash" aria-hidden="true">
    <WipAnimatedDash class="wip-double-dash__line" axis="x" trigger="inView" :delay="0" />
    <WipAnimatedDash class="wip-double-dash__line" axis="x" trigger="inView" :delay="0.1" />
  </div>
</template>

<style scoped>
.wip-double-dash {
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1;
  gap: 14px;
  width: calc(100% + 2 * var(--wip-margin));
  height: 16px;
  margin-top: 80px;
  margin-inline: calc(-1 * var(--wip-margin));
  padding: 0;
}

.wip-double-dash__line {
  flex-shrink: 0;
}
</style>
