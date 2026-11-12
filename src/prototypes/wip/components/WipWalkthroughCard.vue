<script setup>
import { computed, onMounted, ref } from 'vue'
import { motion } from 'motion-v'
import { softSpring } from '../../canvas/motion/tokens.js'
import cornerBracket from '../assets/walkthrough/corner-tl.svg'
import WipTypeOn from './motion/WipTypeOn.vue'

const props = defineProps({
  title: { type: String, required: true },
  background: { type: String, required: true },
  thumb: { type: String, required: true },
  presenter: { type: String, default: 'Gustavo Delgado' },
  href: { type: String, default: '#' },
  thumbTop: { type: Number, default: null },
  hoverRotate: { type: Number, default: -4 },
})

const hoverCapable = ref(true)
const hovered = ref(false)
const creditDelay = 0.12

const thumbPose = computed(() => {
  const r = props.hoverRotate
  const show = hovered.value || !hoverCapable.value
  return show
    ? { opacity: 1, scale: 1, rotate: r }
    : { opacity: 0, scale: 0.92, rotate: r * 1.35 }
})

onMounted(() => {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  hoverCapable.value = canHover && !reduceMotion
})
</script>

<template>
  <article class="wip-walkthrough-card">
    <a
      class="wip-walkthrough-card__link"
      :href="href"
      @pointerenter="hovered = true"
      @pointerleave="hovered = false"
      @focusin="hovered = true"
      @focusout="hovered = false"
    >
      <div class="wip-walkthrough-card__frame">
        <img class="wip-walkthrough-card__corner wip-walkthrough-card__corner--tl" :src="cornerBracket" alt="" />
        <img
          class="wip-walkthrough-card__corner wip-walkthrough-card__corner--tr"
          :src="cornerBracket"
          alt=""
        />
        <img
          class="wip-walkthrough-card__corner wip-walkthrough-card__corner--br"
          :src="cornerBracket"
          alt=""
        />
        <img
          class="wip-walkthrough-card__corner wip-walkthrough-card__corner--bl"
          :src="cornerBracket"
          alt=""
        />

        <div class="wip-walkthrough-card__panel" :style="{ backgroundColor: background }">
          <h3 class="wip-walkthrough-card__title type-display-large">{{ title }}</h3>
          <div
            class="wip-walkthrough-card__thumb"
            :class="{ 'wip-walkthrough-card__thumb--fixed': thumbTop != null }"
            :style="thumbTop != null ? { top: `${thumbTop}px` } : undefined"
          >
            <motion.div
              class="wip-walkthrough-card__thumb-motion"
              :initial="false"
              :animate="thumbPose"
              :transition="softSpring"
            >
              <img :src="thumb" alt="" loading="lazy" />
            </motion.div>
          </div>
          <p class="wip-walkthrough-card__credit">
            <span class="wip-walkthrough-card__with">
              <WipTypeOn class="type-editorial-caption" text="w/" :delay="creditDelay" :ms="28" nowrap />
            </span>
            <WipTypeOn
              class="wip-walkthrough-card__name type-editorial-caption"
              :text="presenter"
              :delay="creditDelay + 0.12"
              :ms="22"
              nowrap
            />
          </p>
        </div>
      </div>
    </a>
  </article>
</template>

<style scoped>
.wip-walkthrough-card {
  flex: 0 0 auto;
  width: 439px;
}

.wip-walkthrough-card__link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.wip-walkthrough-card__frame {
  position: relative;
  width: 439px;
  height: 472px;
}

.wip-walkthrough-card__corner {
  position: absolute;
  z-index: 2;
  width: 24px;
  height: 24px;
  pointer-events: none;
}

.wip-walkthrough-card__corner--tl {
  top: 0;
  left: 0;
}

.wip-walkthrough-card__corner--tr {
  top: 0;
  right: 0;
  transform: scaleX(-1);
}

.wip-walkthrough-card__corner--br {
  right: 0;
  bottom: 0;
  transform: rotate(180deg);
}

.wip-walkthrough-card__corner--bl {
  bottom: 0;
  left: 0;
  transform: scaleY(-1);
}

.wip-walkthrough-card__panel {
  position: absolute;
  top: 24px;
  left: 30px;
  display: flex;
  flex-direction: column;
  width: 378px;
  height: 424px;
  overflow: hidden;
}

.wip-walkthrough-card__title {
  flex-shrink: 0;
  max-width: 351px;
  margin: 21px 18px 0;
  color: #000;
}

.wip-walkthrough-card__thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160px;
  height: 97px;
  transform: translate(-50%, -50%);
}

.wip-walkthrough-card__thumb--fixed {
  top: auto;
  transform: translateX(-50%);
}

.wip-walkthrough-card__thumb-motion {
  width: 100%;
  height: 100%;
  transform-origin: center center;
}

.wip-walkthrough-card__thumb-motion img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wip-walkthrough-card__credit {
  display: flex;
  gap: 4px;
  align-items: center;
  margin: auto 18px 14px;
}

.wip-walkthrough-card__with {
  padding: 2px 4px;
  color: #6b6b6b;
  background: #e4ff97;
}

.wip-walkthrough-card__name {
  color: #000;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .wip-walkthrough-card__thumb-motion {
    transform: none !important;
  }
}
</style>
