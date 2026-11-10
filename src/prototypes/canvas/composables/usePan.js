import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const FRAME = { width: 1800, height: 1070 }
const DRAG_THRESHOLD = 5

export function usePan() {
  const viewport = ref(null)
  const x = ref(0)
  const y = ref(0)
  const panning = ref(false)
  let userHasPanned = false
  let observer
  let stopDrag = () => {}
  let blockNextClick = false

  function centerFrame() {
    const el = viewport.value
    if (!el || userHasPanned) return
    const width = el.clientWidth
    const height = el.clientHeight
    if (!width || !height) return
    x.value = (width - FRAME.width) / 2
    y.value = (height - FRAME.height) / 2
  }

  const worldStyle = computed(() => ({
    transform: `translate(${x.value}px, ${y.value}px)`,
  }))

  function onPointerDown(event) {
    if (event.button !== 0) return

    const surface = event.currentTarget
    const pointerId = event.pointerId
    const startX = event.clientX
    const startY = event.clientY
    const originX = x.value
    const originY = y.value
    let dragging = false

    function onMove(ev) {
      if (ev.pointerId !== pointerId) return
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      if (!dragging) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        dragging = true
        userHasPanned = true
        panning.value = true
        surface.setPointerCapture(pointerId)
      }

      x.value = originX + dx
      y.value = originY + dy
    }

    function onUp(ev) {
      if (ev.pointerId !== pointerId) return

      if (dragging) {
        blockNextClick = true
        try {
          surface.releasePointerCapture(pointerId)
        } catch {
          /* already released */
        }
      }

      panning.value = false
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerup', onUp)
      surface.removeEventListener('pointercancel', onUp)
      stopDrag = () => {}
    }

    stopDrag = () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerup', onUp)
      surface.removeEventListener('pointercancel', onUp)
      panning.value = false
    }

    surface.addEventListener('pointermove', onMove)
    surface.addEventListener('pointerup', onUp)
    surface.addEventListener('pointercancel', onUp)
  }

  function onClickCapture(event) {
    if (!blockNextClick) return
    blockNextClick = false
    event.preventDefault()
    event.stopPropagation()
  }

  function onWheel(event) {
    event.preventDefault()
    userHasPanned = true
    x.value -= event.deltaX
    y.value -= event.deltaY
  }

  onMounted(() => {
    centerFrame()
    observer = new ResizeObserver(() => centerFrame())
    observer.observe(viewport.value)
    viewport.value.addEventListener('wheel', onWheel, { passive: false })
  })

  onBeforeUnmount(() => {
    stopDrag()
    observer?.disconnect()
    viewport.value?.removeEventListener('wheel', onWheel)
  })

  return { viewport, worldStyle, onPointerDown, onClickCapture, panning }
}
