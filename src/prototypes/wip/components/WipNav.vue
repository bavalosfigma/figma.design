<script setup>
import { RouterLink } from 'vue-router'
import WipTypeOn from './motion/WipTypeOn.vue'

const showGrid = defineModel('showGrid', { type: Boolean, default: true })
defineProps({
  runType: { type: Boolean, default: true },
  queue: { type: Boolean, default: true },
})

const swatches = [
  { id: 'white', color: '#fff', active: true, border: '#0d99ff' },
  { id: 'gray', color: '#e2e2e2' },
  { id: 'lime', color: '#e4ff97' },
  { id: 'mint', color: '#f3ffe3' },
  { id: 'cyan', color: '#c7f8fb' },
  { id: 'maroon', color: '#721c1c' },
]
</script>

<template>
  <nav class="wip-nav" aria-label="Site">
    <span class="brand-mark brand-mark--figma type-wordmark">
      <WipTypeOn text="Figma" trigger="mount" :queue="queue" :run="runType" :ms="32" nowrap />
    </span>
    <span class="brand-mark brand-mark--design type-wordmark">
      <WipTypeOn text="Design" trigger="mount" :queue="queue" :run="runType" :ms="32" nowrap />
    </span>

    <div class="toolbar" aria-label="Editor controls">
      <button type="button" class="tool">
        <span class="tool-label type-editorial-caption">Serif</span>
        <span class="chev" aria-hidden="true" />
      </button>
      <button type="button" class="tool">
        <span class="tool-label type-editorial-caption">54px</span>
        <span class="chev" aria-hidden="true" />
      </button>
      <button type="button" class="tool tool--swatches" disabled>
        <span
          v-for="swatch in swatches"
          :key="swatch.id"
          class="swatch"
          :class="{ 'swatch--active': swatch.active }"
          :style="{
            backgroundColor: swatch.color,
            borderColor: swatch.border ?? 'transparent',
          }"
        />
      </button>
      <button type="button" class="tool" @click="showGrid = !showGrid">
        <span class="tool-label type-editorial-caption">Grid</span>
        <span class="grid-box" :class="{ 'grid-box--on': showGrid }" aria-hidden="true" />
      </button>
    </div>

    <div class="actions">
      <RouterLink class="btn btn--outline type-body-small" to="/canvas">View Canvas</RouterLink>
      <a class="btn btn--solid type-body-small" href="https://www.figma.com/careers/" target="_blank" rel="noreferrer">
        Apply now
      </a>
    </div>
  </nav>
</template>

<style scoped>
.wip-nav {
  display: contents;
}

.brand-mark {
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
  padding: 0 12px 0 3px;
  font-size: 24px;
  line-height: 0.85;
  letter-spacing: -0.035em;
  background: #c7f8fb;
  box-sizing: border-box;
}

.brand-mark--figma {
  grid-column: 1;
  align-self: start;
}

.brand-mark--design {
  grid-column: 2;
  align-self: start;
}

.toolbar {
  display: flex;
  align-items: stretch;
  justify-content: center;
  grid-column: 3 / 5;
  align-self: start;
  justify-self: center;
  min-width: 0;
}

.tool {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dfdfdf;
  margin-left: -1px;
  background: #fff;
  color: #6b6b6b;
  cursor: pointer;
}

.tool:disabled {
  cursor: default;
}

.tool:first-child {
  margin-left: 0;
}

.tool-label {
  color: #6b6b6b;
  white-space: nowrap;
}

.chev {
  width: 10px;
  height: 5px;
  background: linear-gradient(to bottom, #6b6b6b 0 40%, transparent 40% 60%, #6b6b6b 60% 100%);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  opacity: 0.55;
}

.tool--swatches {
  gap: 0;
  padding-inline: 10px;
}

.swatch {
  width: 17px;
  height: 17px;
  border: 1px solid transparent;
  flex-shrink: 0;
}

.swatch--active {
  border-color: #0d99ff;
}

.grid-box {
  width: 16px;
  height: 16px;
  border: 1px solid #000;
  background: #fff;
}

.grid-box--on {
  background: #000;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  grid-column: 5 / -1;
  align-self: start;
  justify-self: end;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 2px 10px;
  text-decoration: none;
  white-space: nowrap;
}

.btn--outline {
  border: 1.5px solid #000;
  color: #121212;
  background: transparent;
}

.btn--solid {
  border: none;
  background: #000;
  color: #fff;
}
</style>
