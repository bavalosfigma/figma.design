import { onMounted, ref } from 'vue'
import { spring, softSpring } from '../../canvas/motion/tokens.js'

export const wipViewport = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -48px 0px',
}

export function useWipReducedMotion() {
  const reduceMotion = ref(false)

  onMounted(() => {
    reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  return reduceMotion
}

export { spring, softSpring }
