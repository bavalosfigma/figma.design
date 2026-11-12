import { reactive, ref } from 'vue'
import { brandOutlines } from '../data/brandOutlines.js'
import { commandsToPathD, getPathHandles, moveOnPathPoint, parsePathD } from '../utils/svgPath.js'

function segmentForPath(layoutId, pathIndex) {
  if (layoutId === 'brand-figma') {
    return pathIndex === 5 ? 'dot' : 'figma'
  }
  return 'design'
}

const pathState = reactive(
  Object.fromEntries(
    Object.entries(brandOutlines).map(([layoutId, mark]) => [
      layoutId,
      mark.paths.map((path, pathIndex) => ({
        fill: path.fill,
        segment: path.segment ?? segmentForPath(layoutId, pathIndex),
        commands: parsePathD(path.d),
      })),
    ]),
  ),
)

export const wipBrandSelection = ref(null)

export function selectWipBrandSegment(layoutId, segment) {
  wipBrandSelection.value = { layoutId, segment }
}

export function clearWipBrandSelection() {
  wipBrandSelection.value = null
}

export function isWipSegmentSelected(layoutId, segment) {
  const sel = wipBrandSelection.value
  return sel?.layoutId === layoutId && sel?.segment === segment
}

export function wipPathsForLayout(layoutId) {
  return pathState[layoutId] ?? []
}

export function wipPathD(path) {
  return commandsToPathD(path.commands)
}

export function wipHandlesForLayout(layoutId) {
  return (pathState[layoutId] ?? []).flatMap((path, pathIndex) =>
    getPathHandles(path.commands).map((handle) => ({
      ...handle,
      pathIndex,
    })),
  )
}

export function wipHandlesForSelection(layoutId) {
  const sel = wipBrandSelection.value
  if (!sel || sel.layoutId !== layoutId) return []

  return pathState[layoutId].flatMap((path, pathIndex) => {
    if (path.segment !== sel.segment) return []
    return getPathHandles(path.commands).map((handle) => ({
      ...handle,
      pathIndex,
    }))
  })
}

export function nudgeWipBrandPathPoint(layoutId, pathIndex, commandIndex, dx, dy) {
  const path = pathState[layoutId]?.[pathIndex]
  if (!path) return
  moveOnPathPoint(path.commands, commandIndex, dx, dy)
}
