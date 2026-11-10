import { reactive } from 'vue'
import { canvasItems } from '../data/items.js'

export function useCanvasCardNotes() {
  const notes = reactive(Object.fromEntries(canvasItems.map((item) => [item.id, ''])))
  return { notes }
}
