<script setup>
import { useDialKit } from 'dialkit/vue'
import WipEyebrow from './WipEyebrow.vue'
import WipWalkthroughCard from './WipWalkthroughCard.vue'
import { wipWalkthroughItems } from '../data/walkthroughItems.js'

const hover = useDialKit(
  'Walkthrough hover',
  {
    rest: {
      opacity: [0, 0, 1, 0.01],
      scale: [0.6, 0.4, 1.5, 0.01],
      rotate: [2.42, 0, 3, 0.01],
    },
    hover: {
      opacity: [1, 0, 1, 0.01],
      scale: [1.39, 0.4, 1.6, 0.01],
      rotate: [1, -2, 3, 0.01],
    },
    spring: { type: 'spring', stiffness: 391, damping: 50 },
  },
  { id: 'wip-01-walkthrough-hover' },
)
</script>

<template>
  <section class="wip-walkthrough" aria-labelledby="wip-walkthrough-heading">
    <WipEyebrow index="01" label="Recent walkthroughs" />
    <h2 id="wip-walkthrough-heading" class="wip-walkthrough__title type-display-xl">
      Design walkthroughs
    </h2>

    <div class="wip-walkthrough__track" role="list">
      <WipWalkthroughCard
        v-for="item in wipWalkthroughItems"
        :key="item.id"
        v-bind="item"
        :hover="hover"
      />
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
  color: var(--wip-ink);
}

.wip-walkthrough__track {
  display: flex;
  grid-column: 1 / -1;
  gap: 73px;
  align-items: flex-start;
  width: calc(100% + 2 * var(--wip-margin));
  margin-top: 108px;
  margin-inline: calc(-1 * var(--wip-margin));
  padding-inline: var(--wip-margin);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.wip-walkthrough__track::-webkit-scrollbar {
  display: none;
}
</style>
