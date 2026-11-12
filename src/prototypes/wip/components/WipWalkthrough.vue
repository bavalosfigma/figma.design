<script setup>
import WipEyebrow from './WipEyebrow.vue'
import WipWalkthroughCard from './WipWalkthroughCard.vue'
import { wipWalkthroughItems } from '../data/walkthroughItems.js'
</script>

<template>
  <section class="wip-walkthrough" aria-labelledby="wip-walkthrough-heading">
    <WipEyebrow index="01" label="Recent walkthroughs" />
    <h2 id="wip-walkthrough-heading" class="wip-walkthrough__title type-display-xl">
      Design walkthroughs
    </h2>

    <div class="wip-walkthrough__track" role="list">
      <WipWalkthroughCard v-for="item in wipWalkthroughItems" :key="item.id" v-bind="item" />
    </div>
  </section>
</template>

<style scoped>
.wip-walkthrough {
  position: relative;
  z-index: 3;
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  margin-top: 80px;
}

.wip-walkthrough :deep(.wip-eyebrow) {
  grid-column: 1 / -1;
}

.wip-walkthrough__title {
  grid-column: 1 / -1;
  margin: 34px 0 0;
  color: #000;
}

.wip-walkthrough__track {
  display: flex;
  grid-column: 1 / -1;
  gap: 73px;
  align-items: flex-start;
  width: calc(100% + 2 * var(--wip-margin));
  margin-top: 108px;
  margin-inline: calc(-1 * var(--wip-margin));
  padding-bottom: 4px;
  padding-inline: var(--wip-margin);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}
</style>
