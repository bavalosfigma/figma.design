<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { motion } from 'motion-v'
import PanStage from './PanStage.vue'
import ArrowMark from './ArrowMark.vue'
import BrandWordmark from './BrandWordmark.vue'
import CanvasCardModal from './CanvasCardModal.vue'
import { brandWordmarks, canvasItems, getCanvasCardMeta } from '../data/items.js'
import { useCanvasCardNotes } from '../composables/useCanvasCardNotes.js'
import { clearBrandSelection } from '../composables/useBrandPathState.js'
import { softSpring } from '../motion/tokens.js'
import {
  canvasOutwardStaggerIndex,
  canvasPlaceFrom,
  canvasPlaceTo,
  canvasPlaceTransition,
} from '../motion/fall.js'

const { notes } = useCanvasCardNotes()
const selectedId = ref(null)

const selectedMeta = computed(() => {
  const item = canvasItems.find((entry) => entry.id === selectedId.value)
  return item ? getCanvasCardMeta(item) : null
})

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

function place(item) {
  return {
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: item.w ? `${item.w}px` : undefined,
    height: item.h ? `${item.h}px` : undefined,
  }
}

function enterProps(item) {
  if (reducedMotion.value) {
    return { initial: false, animate: canvasPlaceTo }
  }
  return {
    initial: canvasPlaceFrom,
    animate: canvasPlaceTo,
    transition: canvasPlaceTransition(
      canvasOutwardStaggerIndex(canvasItems, item.id),
      reducedMotion.value,
    ),
  }
}

function openCard(item) {
  selectedId.value = item.id
}

function closeModal() {
  selectedId.value = null
}

function onSaveNotes(value) {
  if (selectedId.value) notes[selectedId.value] = value
}
</script>

<template>
  <PanStage @blank-pointerdown="clearBrandSelection">
    <div class="brand-layer">
      <BrandWordmark
        v-for="mark in brandWordmarks"
        :key="mark.layoutId"
        :layout-id="mark.layoutId"
        :text="mark.text"
        canvas
        editable
        :x="mark.canvas.x"
        :y="mark.canvas.y"
      />
    </div>

    <motion.article
      v-for="item in canvasItems"
      :key="item.id"
      class="node group"
      :style="place(item)"
      v-bind="enterProps(item)"
      :while-hover="{ scale: 1.02, transition: softSpring }"
      role="button"
      tabindex="0"
      :aria-label="`Open ${getCanvasCardMeta(item).title}`"
      @click.stop="openCard(item)"
      @keydown.enter.stop="openCard(item)"
    >
      <div v-if="item.type === 'mission'" class="mission">
        <ArrowMark class="mission-arrow" />
        <p class="type-title-medium">Mission</p>
      </div>

      <div v-else-if="item.type === 'config'" class="config">
        <div class="media" />
        <div class="foot">
          <p class="type-body-large">Config</p>
          <ArrowMark />
        </div>
      </div>

      <div v-else-if="item.type === 'team'" class="team">
        <span class="chip type-body-small">{{ item.label }}</span>
      </div>

      <div v-else-if="item.type === 'history'" class="history">
        <span class="chip type-body-small">{{ item.label }}</span>
      </div>

      <div v-else-if="item.type === 'roles'" class="roles">
        <div class="disc">
          <p class="type-display-xl">Open<br />Roles</p>
        </div>
      </div>

      <span v-if="notes[item.id]" class="note-dot" aria-hidden="true" />
    </motion.article>
  </PanStage>

  <CanvasCardModal
    :open="Boolean(selectedId && selectedMeta)"
    :title="selectedMeta?.title ?? ''"
    :blurb="selectedMeta?.blurb ?? ''"
    :model-value="selectedId ? notes[selectedId] : ''"
    @update:model-value="onSaveNotes"
    @close="closeModal"
  />
</template>

<style scoped>
.brand-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.node {
  position: absolute;
  pointer-events: auto;
  transform-origin: center bottom;
  cursor: pointer;
}

.note-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #121212;
  box-shadow: 0 0 0 2px #fff;
}

.mission {
  position: relative;
  height: 100%;
  background: #f2ef4a;
  border-radius: 22px;
  color: #121212;
}

.mission-arrow {
  position: absolute;
  top: 8px;
  right: 8px;
}

.mission p {
  position: absolute;
  left: 16px;
  bottom: 18px;
}

.config {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #efefef;
  border-radius: 18px;
}

.config .media {
  height: 298px;
  background: #d4d4d4;
}

.config .foot {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 12px;
}

.team,
.history {
  position: relative;
  height: 100%;
  background: #d4d4d4;
}

.team {
  border-radius: 16px;
}

.history {
  border-radius: 22px;
}

.chip {
  position: absolute;
  border-radius: 999px;
  padding: 6px 12px;
}

.team .chip {
  top: 15px;
  left: 15px;
  background: #e3d4f8;
}

.history .chip {
  bottom: 16px;
  left: 12px;
  background: #f4f4f4;
}

.roles {
  height: 100%;
  padding: 10px;
  background: #6e2a22;
  border-radius: 28px;
}

.disc {
  display: grid;
  height: 100%;
  place-items: center;
  border-radius: 50%;
  background: #f4f1dc;
  color: #6e2a22;
  text-align: center;
}

.disc p {
  color: #6e2a22;
}

@media (prefers-reduced-motion: reduce) {
  .node {
    transform: none !important;
  }
}
</style>
