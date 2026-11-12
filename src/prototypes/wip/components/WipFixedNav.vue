<script setup>
import { ref, watch } from 'vue'
import WipNav from './WipNav.vue'
import WipAnimatedDash from './motion/WipAnimatedDash.vue'

const showGrid = defineModel('showGrid', { type: Boolean, default: false })
const visible = defineModel('visible', { type: Boolean, default: false })

const dashDrawKey = ref(0)

watch(visible, (isVisible) => {
  if (isVisible) dashDrawKey.value += 1
})
</script>

<template>
  <header
    class="wip-fixed-nav"
    :class="{ 'wip-fixed-nav--visible': visible }"
    :aria-hidden="!visible"
  >
    <div class="wip-fixed-nav__inner">
      <WipNav v-model:show-grid="showGrid" :run-type="visible" :queue="false" />
    </div>
    <WipAnimatedDash
      v-if="visible"
      :key="dashDrawKey"
      class="wip-fixed-nav__dash"
      axis="x"
      trigger="mount"
      :delay="0.05"
    />
  </header>
</template>

<style scoped>
.wip-fixed-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  visibility: hidden;
  background: var(--wip-bg);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

.wip-fixed-nav--visible {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}

.wip-fixed-nav__dash {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
}

.wip-fixed-nav__inner {
  display: grid;
  grid-template-columns: repeat(var(--wip-columns), minmax(0, 1fr));
  column-gap: var(--wip-gutter);
  max-width: var(--wip-design-width);
  padding: 9px var(--wip-margin) 11px;
  margin-inline: auto;
}
</style>
