<script setup>
import { computed, ref } from 'vue'
import { useDialTimeline } from 'dialkit/vue'
import { WIP_HERO_MARK_SCALE, brandOutlines } from '../data/brandOutlines.js'
import WipBrandWordmark from './WipBrandWordmark.vue'
import WipEyebrow from './WipEyebrow.vue'
import WipIntroCopy from './WipIntroCopy.vue'
import WipEditable from './WipEditable.vue'
import WipInformation from './WipInformation.vue'

const props = defineProps({
  markColor: {
    type: String,
    default: '',
  },
})

const introFontSize = ref(72)

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const LETTER_STAGGER = 0.05
const LETTER_DURATION = 0.56

const WORDMARKS = [
  { id: 'figma', layoutId: 'brand-figma', glyphs: ['F', 'i', 'g', 'm', 'a', 'dot'] },
  { id: 'design', layoutId: 'brand-design', glyphs: ['D', 'e', 's', 'i', 'g', 'n'] },
]

function letterClip(at) {
  return {
    at,
    duration: LETTER_DURATION,
    transition: { type: 'spring', stiffness: 401, damping: 50, mass: 0.8 },
    from: {
      opacity: [0, 0, 1, 0.01],
      y: [400, -200, 400, 1],
      rotate: [45, -45, 45, 0.1],
    },
    to: {
      opacity: [1, 0, 1, 0.01],
      y: [0, -200, 400, 1],
      rotate: [0, -45, 45, 0.1],
    },
  }
}

function wordmarkTimeline() {
  const clips = {}
  let index = 0
  for (const word of WORDMARKS) {
    const count = brandOutlines[word.layoutId].paths.length
    const glyphs = {}
    for (let glyphIndex = 0; glyphIndex < count; glyphIndex += 1) {
      const key = word.glyphs[glyphIndex] ?? `letter${glyphIndex}`
      glyphs[key] = letterClip(Number((index * LETTER_STAGGER).toFixed(3)))
      index += 1
    }
    clips[word.id] = glyphs
  }
  return {
    duration: Number((LETTER_STAGGER * Math.max(0, index - 1) + LETTER_DURATION).toFixed(2)),
    ...clips,
  }
}

// TODO(production): DialKit's clip.current values are the scrubbable authoring preview.
// Replace them with equivalent real Motion animations using the tuned timeline
// timings and transitions, then remove useDialTimeline and <DialTimeline />.
const timeline = useDialTimeline(
  'Figma.Design (WIP 01)',
  wordmarkTimeline(),
  { autoplay: true, persist: true },
)

const restPose = { opacity: 1, y: 0, rotate: 0 }

function posesFor(word) {
  return computed(() => {
    const count = brandOutlines[word.layoutId].paths.length
    return Array.from({ length: count }, (_, glyphIndex) => {
      if (reduceMotion) return restPose
      const key = word.glyphs[glyphIndex] ?? `letter${glyphIndex}`
      return timeline.value[word.id]?.[key]?.current ?? restPose
    })
  })
}

const figmaPoses = posesFor(WORDMARKS[0])
const designPoses = posesFor(WORDMARKS[1])
</script>

<template>
  <div class="wip-hero">
    <div class="wip-hero__wordmarks" aria-label="Figma.Design">
      <WipBrandWordmark
        layout-id="brand-figma"
        text="Figma."
        :scale="WIP_HERO_MARK_SCALE"
        :letter-poses="figmaPoses"
        :fill="props.markColor"
      />
      <WipBrandWordmark
        layout-id="brand-design"
        text="Design"
        :scale="WIP_HERO_MARK_SCALE"
        :letter-poses="designPoses"
        :fill="props.markColor"
      />
    </div>
    <div class="wip-hero__below">
      <div class="wip-hero__meta">
        <WipEyebrow trigger="mount" queue />
        <WipEditable v-model:font-size="introFontSize" />
      </div>
      <WipIntroCopy class="wip-hero__intro" :font-size="introFontSize" />
      <WipInformation class="wip-hero__information" />
    </div>
  </div>
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

.wip-hero__wordmarks,
.wip-hero__meta,
.wip-hero__intro {
  grid-column: 1 / -1;
}

.wip-hero__below {
  display: contents;
}

.wip-hero__wordmarks {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-top: 60px;
  line-height: 0;
}

.wip-hero__wordmarks :deep(.wip-wordmark + .wip-wordmark) {
  margin-left: 30px;
}

.wip-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 24px;
}

.wip-hero__information {
  grid-column: 7 / 9;
  margin-top: 80px;
}
</style>
