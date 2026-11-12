<script setup>
import { computed } from 'vue'
import { motion } from 'motion-v'
import { RouterLink } from 'vue-router'
import { wipGalleryItems } from '../data/galleryItems.js'
import WipTypeOn from './motion/WipTypeOn.vue'
import { spring, useWipReducedMotion } from '../composables/useWipMotion.js'

const reduceMotion = useWipReducedMotion()
const rowItems = wipGalleryItems.slice(0, 4)

const markerBind = computed(() => {
  const reveal = { scale: 1, opacity: 1 }
  const hidden = { scale: 0, opacity: 0 }
  if (reduceMotion.value) {
    return { initial: reveal, animate: reveal }
  }
  return {
    initial: hidden,
    whileInView: reveal,
    viewport: { once: true, amount: 0.3 },
    transition: { ...spring, delay: 0.05 },
  }
})

function imgStyle(item) {
  if (!item.objectPosition) return undefined
  return { objectPosition: item.objectPosition }
}
</script>

<template>
  <section class="wip-gallery" aria-labelledby="wip-gallery-heading">
    <header class="wip-gallery__header">
      <p id="wip-gallery-heading" class="wip-gallery__eyebrow">
        <motion.span class="wip-gallery__marker" aria-hidden="true" v-bind="markerBind" />
        <WipTypeOn
          class="type-editorial-caption"
          text="Recently Added to Canvas"
          :delay="0.08"
          :ms="22"
          nowrap
        />
      </p>
      <RouterLink class="wip-gallery__cta type-body-small" to="/canvas">Explore Canvas</RouterLink>
    </header>

    <div class="wip-gallery__grid">
      <figure v-for="(item, index) in rowItems" :key="item.id" class="wip-gallery__item">
        <div
          class="wip-gallery__media"
          :class="{
            'wip-gallery__media--green': item.variant === 'green',
          }"
          :style="{ height: `${item.mediaHeight}px` }"
        >
          <img
            :src="item.src"
            alt=""
            loading="lazy"
            :style="item.variant === 'green' ? undefined : imgStyle(item)"
            :class="{
              'wip-gallery__img--contain': item.fit === 'contain',
              'wip-gallery__img--green': item.variant === 'green',
            }"
          />
        </div>
        <WipTypeOn
          as="figcaption"
          class="wip-gallery__caption type-editorial-caption"
          :text="item.label"
          :delay="0.2 + index * 0.06"
          :ms="16"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.wip-gallery {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  margin-top: 80px;
}

.wip-gallery__header {
  display: flex;
  grid-column: 1 / -1;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.wip-gallery__eyebrow {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  color: var(--wip-ink-soft);
}

.wip-gallery__marker {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background: #c7f8fb;
}

.wip-gallery__cta {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 2px 10px;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  background: #000;
}

.wip-gallery__grid {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  gap: 16px;
  align-items: start;
  margin-top: 38px;
}

.wip-gallery__item {
  display: flex;
  grid-column: span 2;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  margin: 0;
}

.wip-gallery__media {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.wip-gallery__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wip-gallery__img--contain {
  object-fit: contain;
}

.wip-gallery__media--green {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a5c35;
}

.wip-gallery__img--green {
  width: auto;
  max-width: 59%;
  height: auto;
  max-height: 81%;
  object-fit: contain;
}

.wip-gallery__caption {
  margin: 0;
  color: var(--wip-ink-soft);
  word-break: break-word;
}
</style>
