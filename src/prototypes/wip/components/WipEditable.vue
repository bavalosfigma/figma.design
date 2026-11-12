<script setup>
const MIN = 32
const MAX = 96

const fontSize = defineModel('fontSize', { type: Number, default: 96 })
</script>

<template>
  <div class="wip-editable" aria-label="Font size">
    <div class="wip-editable__row">
      <input
        id="wip-font-size"
        v-model.number="fontSize"
        class="wip-editable__slider"
        type="range"
        :min="MIN"
        :max="MAX"
        step="1"
        aria-label="Font size"
      />
      <span class="wip-editable__value type-editorial-caption">{{ fontSize }}px</span>
    </div>
  </div>
</template>

<style scoped>
.wip-editable {
  flex-shrink: 0;
}

.wip-editable__row {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  align-items: flex-start;
}

.wip-editable__value {
  flex-shrink: 0;
  color: #121212;
  white-space: nowrap;
}

.wip-editable__slider {
  width: 240px;
  flex-shrink: 0;
  accent-color: #000;
}
</style>
