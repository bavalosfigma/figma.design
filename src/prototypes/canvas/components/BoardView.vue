<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import BrandWordmark from './BrandWordmark.vue'
import { clearBrandSelection } from '../composables/useBrandPathState.js'
import { brandWordmarks, columnsFor, filters } from '../data/items.js'
import { softSpring, wipe } from '../motion/tokens.js'
import {
  boardCardStaggerIndex,
  boardPlaceFrom,
  boardPlaceTo,
  boardPlaceTransition,
} from '../motion/fall.js'

const current = ref('Everything')
const columns = computed(() => columnsFor(current.value))

const reducedMotion = ref(false)
let media

onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = media.matches
  media.addEventListener('change', onMotionPreference)
})

onUnmounted(() => {
  media?.removeEventListener('change', onMotionPreference)
})

function onMotionPreference(event) {
  reducedMotion.value = event.matches
}

function onBoardPointerDown(event) {
  if (event.target.closest('.wordmark-root')) return
  clearBrandSelection()
}

function cardEnter(columnIndex, cardIndex) {
  if (reducedMotion.value) {
    return { initial: false, animate: boardPlaceTo }
  }
  const index = boardCardStaggerIndex(columns.value, columnIndex, cardIndex)
  return {
    initial: boardPlaceFrom,
    animate: boardPlaceTo,
    transition: boardPlaceTransition(index, reducedMotion.value),
  }
}
</script>

<template>
  <div class="board" @pointerdown="onBoardPointerDown">
    <div class="inner">
      <header class="mast">
        <BrandWordmark
          v-for="mark in brandWordmarks"
          :key="mark.layoutId"
          :layout-id="mark.layoutId"
          :text="mark.text"
          editable
        />
      </header>

      <div class="filters" role="tablist" aria-label="Board filters">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          class="filter type-body motion-color group"
          role="tab"
          :aria-selected="current === filter"
          :class="{ active: current === filter }"
          @click="current = filter"
        >
          <AnimatePresence>
            <motion.span
              v-if="current === filter"
              class="filter-wipe"
              :initial="{ opacity: 0, x: '-100%' }"
              :animate="{ opacity: 1, x: '0%' }"
              :exit="{ opacity: 0 }"
              :transition="{ default: wipe }"
            />
          </AnimatePresence>
          <span class="filter-label">{{ filter }}</span>
        </button>
      </div>

      <div class="columns" :key="current">
        <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="column">
          <motion.article
            v-for="(card, cardIndex) in column"
            :key="`${current}-${card.id}`"
            class="card"
            v-bind="cardEnter(columnIndex, cardIndex)"
            :while-hover="{ scale: 1.02, transition: softSpring }"
          >
            <p class="date type-body-small">{{ card.date }}</p>
            <p class="copy type-body-small-light">{{ card.text }}</p>
            <div class="media" :style="{ height: `${card.image}px` }" />
          </motion.article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  height: 100%;
  overflow: auto;
  background: #fff;
}

.inner {
  width: min(1800px, 100%);
  margin: 0 auto;
  padding: 87px 32px 140px;
}

.mast {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 38px 0;
}

.filter {
  position: relative;
  overflow: hidden;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  background: #fff;
}

.filter.active {
  border-color: #121212;
}

.filter-wipe {
  position: absolute;
  inset: 0;
  background: #f2ef4a;
  z-index: 0;
}

.filter-label {
  position: relative;
  z-index: 1;
}

.columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  align-items: start;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card {
  padding: 16px;
  background: #f3f3f3;
  border-radius: 18px;
  transform-origin: center bottom;
}

.date {
  margin-bottom: 10px;
  color: #6b6b6b;
}

.media {
  margin-top: 18px;
  background: #d4d4d4;
  border-radius: 12px;
}

@media (max-width: 1100px) {
  .columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transform: none !important;
  }
}
</style>
