<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { DialRoot } from 'dialkit/vue'
import { prototypes } from './prototypes/registry.js'

const activeId = ref(prototypes[0].id)
const menuOpen = ref(false)
const dialOpen = ref(false)

const active = computed(() => prototypes.find((item) => item.id === activeId.value) ?? prototypes[0])

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

function choose(id) {
  activeId.value = id
  menuOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <component :is="active.component" />
  <DialRoot v-if="dialOpen" @open-change="dialOpen = $event" />
  <div v-if="menuOpen" class="scrim" @click.self="menuOpen = false">
    <nav class="menu" aria-label="Prototypes">
      <p class="type-label-xsmall label">Prototypes</p>
      <button
        v-for="item in prototypes"
        :key="item.id"
        type="button"
        class="type-body"
        :class="{ current: item.id === activeId }"
        @click="choose(item.id)"
      >
        {{ item.name }}
      </button>
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

.menu button {
  padding: 12px;
  border-radius: 10px;
  text-align: left;
}

.menu button.current {
  background: #f2f2f2;
}
</style>
