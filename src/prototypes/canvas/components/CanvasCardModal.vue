<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { AnimatePresence, motion } from 'motion-v'
import { fade, springLayout } from '../motion/tokens.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  blurb: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const draft = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) draft.value = props.modelValue
  },
)

function save() {
  emit('update:modelValue', draft.value.trim())
  emit('close')
}

function onBackdropClick() {
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        class="scrim"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="fade"
        @click.self="onBackdropClick"
      >
        <motion.div
          class="dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          :initial="{ opacity: 0, y: 24, scale: 0.98 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 16, scale: 0.98 }"
          :transition="{ opacity: fade, y: springLayout, scale: springLayout }"
        >
          <header class="head">
            <div>
              <h2 class="type-title-medium title">{{ title }}</h2>
              <p v-if="blurb" class="type-body-small blurb">{{ blurb }}</p>
            </div>
            <button type="button" class="close type-body-small" aria-label="Close" @click="emit('close')">
              Close
            </button>
          </header>

          <label class="field">
            <span class="type-label-xsmall label">Notes</span>
            <textarea
              v-model="draft"
              class="input type-body-small"
              rows="6"
              placeholder="Add context, links, or next steps…"
            />
          </label>

          <footer class="foot">
            <button type="button" class="ghost type-body-small" @click="emit('close')">Cancel</button>
            <button type="button" class="save type-body-small" @click="save">Save</button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
.scrim {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(18, 18, 18, 0.32);
}

.dialog {
  width: min(440px, 100%);
  padding: 20px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  color: #121212;
}

.blurb {
  margin: 6px 0 0;
  color: #6b6b6b;
}

.close {
  flex-shrink: 0;
  padding: 4px 0;
  color: #6b6b6b;
}

.close:hover {
  color: #121212;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: #6b6b6b;
  text-transform: uppercase;
}

.input {
  width: 100%;
  min-height: 132px;
  padding: 12px;
  border: 1px solid #e4e4e4;
  border-radius: 12px;
  resize: vertical;
  color: #121212;
  background: #fafafa;
}

.input:focus {
  outline: none;
  border-color: #121212;
  background: #fff;
}

.foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.ghost,
.save {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
}

.ghost {
  color: #6b6b6b;
}

.ghost:hover {
  color: #121212;
}

.save {
  background: #121212;
  color: #fff;
}

.save:hover {
  background: #2a2a2a;
}
</style>
