import { springLayout } from './tokens.js'

/** Shared “set from below” placement (board + canvas nodes). */
export const PLACE_FROM_BELOW_OFFSET = 120
export const PLACE_STAGGER_STEP = 0.07

export const placeFromBelow = {
  y: PLACE_FROM_BELOW_OFFSET,
  opacity: 0,
}

export const placeSettled = {
  y: 0,
  opacity: 1,
}

export function placeStaggerTransition(index, reducedMotion = false) {
  if (reducedMotion) {
    return { duration: 0 }
  }
  return {
    ...springLayout,
    delay: index * PLACE_STAGGER_STEP,
  }
}

/** Canvas nodes: same rise as board, plus scale-down + center → edge stagger. */
export const CANVAS_INITIAL_SCALE = 1.2

export const canvasPlaceFrom = {
  ...placeFromBelow,
  scale: CANVAS_INITIAL_SCALE,
}

export const canvasPlaceTo = {
  ...placeSettled,
  scale: 1,
}

function canvasItemCenter(item) {
  const w = item.w ?? 0
  const h = item.h ?? 0
  return { x: item.x + w / 2, y: item.y + h / 2 }
}

function canvasLayoutCenter(items) {
  const centers = items.map(canvasItemCenter)
  const cx = centers.reduce((sum, c) => sum + c.x, 0) / centers.length
  const cy = centers.reduce((sum, c) => sum + c.y, 0) / centers.length
  return { cx, cy }
}

/** Closest to layout centroid first, then outward. */
export function canvasOutwardStaggerIndex(items, itemId) {
  const { cx, cy } = canvasLayoutCenter(items)
  const order = items
    .map((item) => {
      const c = canvasItemCenter(item)
      return { id: item.id, dist: Math.hypot(c.x - cx, c.y - cy) }
    })
    .sort((a, b) => a.dist - b.dist)
  const index = order.findIndex((entry) => entry.id === itemId)
  return index >= 0 ? index : 0
}

export const canvasPlaceTransition = placeStaggerTransition

/** Row-by-row (left → right), like cards being set onto the board. */
export function boardCardStaggerIndex(columns, columnIndex, cardIndex) {
  return cardIndex * columns.length + columnIndex
}

export const boardPlaceFrom = placeFromBelow
export const boardPlaceTo = placeSettled
export const boardPlaceTransition = placeStaggerTransition
