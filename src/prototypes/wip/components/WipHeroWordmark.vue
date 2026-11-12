<script setup>
import { ref } from 'vue'
import WipEyebrow from './WipEyebrow.vue'
import WipIntroCopy from './WipIntroCopy.vue'
import WipEditable from './WipEditable.vue'

const introFontSize = ref(96)
</script>

<template>
  <section class="wip-hero" aria-label="Introduction">
    <div class="wip-hero__pin">
      <div class="wip-hero__meta">
        <WipEyebrow trigger="mount" queue />
        <WipEditable v-model:font-size="introFontSize" />
      </div>
      <WipIntroCopy class="wip-hero__intro" :font-size="introFontSize" />
    </div>
  </section>
</template>

<style scoped>
.wip-hero {
  position: relative;
  z-index: 3;
  display: grid;
  align-content: start;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
}

.wip-hero__pin {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  align-content: start;
  align-self: start;
}

.wip-hero__meta,
.wip-hero__intro {
  grid-column: 1 / -1;
}

.wip-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 60px;
}
</style>
