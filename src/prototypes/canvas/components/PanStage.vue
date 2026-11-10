<script setup>
import { usePan } from '../composables/usePan.js'

const emit = defineEmits(['blank-pointerdown'])

const { viewport, worldStyle, onPointerDown, onClickCapture, panning } = usePan()

function handlePointerDown(event) {
  const target = event.target
  if (target === event.currentTarget || target.classList.contains('world')) {
    emit('blank-pointerdown')
  }
  onPointerDown(event)
}
</script>

<template>
  <div ref="viewport" class="viewport">
    <div
      class="stage"
      :class="{ 'is-panning': panning }"
      @pointerdown="handlePointerDown"
      @click.capture="onClickCapture"
    >
      <div class="world" :style="worldStyle">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewport {
  position: absolute;
  inset: 0;
  background: #fff;
  overflow: hidden;
}

.stage {
  position: absolute;
  inset: 0;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.stage.is-panning {
  cursor: grabbing;
}

.world {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  transform-origin: 0 0;
  will-change: transform;
}
</style>
