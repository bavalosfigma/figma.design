<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { DialRoot, DialTimeline } from 'dialkit/vue'
import SiteCursor from './components/SiteCursor.vue'
import { prototypes } from './prototypes/registry.js'

const route = useRoute()
const menuOpen = ref(false)
const dialOpen = ref(false)

const activeId = computed(() => route.name ?? 'canvas')

function onDialVisibility(visible) {
  dialOpen.value = visible
}

function isTyping(target) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function onKey(event) {
  if (isTyping(event.target)) return
  if (event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key === 'm' || event.key === 'M') {
    event.preventDefault()
    menuOpen.value = !menuOpen.value
  } else if (event.key === 'd' || event.key === 'D') {
    event.preventDefault()
    dialOpen.value = !dialOpen.value
  } else if (event.key === 'Escape') {
    menuOpen.value = false
    dialOpen.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <RouterView />
  <DialTimeline :visible="dialOpen" :on-visibility-change="onDialVisibility" />
  <DialRoot v-if="dialOpen" @open-change="dialOpen = $event" />
  <SiteCursor />
  <div v-if="menuOpen" class="scrim" @click.self="menuOpen = false">
    <nav class="menu" aria-label="Prototypes">
      <p class="type-label-xsmall label">Prototypes</p>
      <RouterLink
        v-for="item in prototypes"
        :key="item.id"
        :to="item.path"
        class="type-body link"
        :class="{ current: item.id === activeId }"
        @click="menuOpen = false"
      >
        {{ item.name }}
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(18, 18, 18, 0.35);
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: min(320px, calc(100% - 48px));
  padding: 20px;
  background: #fff;
  border-radius: 16px;
}

.label {
  margin-bottom: 8px;
  color: #6b6b6b;
}

.link {
  padding: 12px;
  border-radius: 10px;
  text-align: left;
  text-decoration: none;
  color: inherit;
}

.link.current {
  background: #f2f2f2;
}
</style>
