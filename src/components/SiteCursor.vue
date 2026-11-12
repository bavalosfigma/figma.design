<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import cursorUrl from '../prototypes/canvas/assets/cursor.svg'

const x = ref(-32)
const y = ref(-32)
const visible = ref(false)

function onMove(event) {
  x.value = event.clientX
  y.value = event.clientY
  visible.value = true
}

function onLeave() {
  visible.value = false
}

onMounted(() => {
  document.documentElement.classList.add('site-cursor')
  window.addEventListener('pointermove', onMove)
  document.documentElement.addEventListener('mouseleave', onLeave)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('site-cursor')
  window.removeEventListener('pointermove', onMove)
  document.documentElement.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <img
    class="site-cursor"
    :class="{ 'is-hidden': !visible }"
    :src="cursorUrl"
    alt=""
    width="16"
    height="16"
    draggable="false"
    :style="{ transform: `translate(${x}px, ${y}px)` }"
  />
</template>

<style>
html.site-cursor,
html.site-cursor * {
  cursor: none !important;
}
</style>

<style scoped>
.site-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2147483646;
  pointer-events: none;
  user-select: none;
}

.site-cursor.is-hidden {
  opacity: 0;
}
</style>
