import { reactive, ref } from 'vue'
import { brandOutlines } from '../data/brandOutlines.js'
import { commandsToPathD, getPathHandles, moveOnPathPoint, parsePathD } from '../utils/svgPath.js'

/** Click targets: Figma word = figma | dot; Design word = design */
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

export const brandPathSelection = ref(null)

export function selectBrandSegment(layoutId, segment) {
  brandPathSelection.value = { layoutId, segment }
}

export function clearBrandSelection() {
  brandPathSelection.value = null
}

export function isSegmentSelected(layoutId, segment) {
  const sel = brandPathSelection.value
  return sel?.layoutId === layoutId && sel?.segment === segment
}

export function pathsForLayout(layoutId) {
  return pathState[layoutId] ?? []
}

export function pathD(path) {
  return commandsToPathD(path.commands)
}

export function handlesForSelection(layoutId) {
  const sel = brandPathSelection.value
  if (!sel || sel.layoutId !== layoutId) return []

  return pathState[layoutId].flatMap((path, pathIndex) => {
    if (path.segment !== sel.segment) return []
    return getPathHandles(path.commands).map((handle) => ({
      ...handle,
      pathIndex,
    }))
  })
}

export function nudgeBrandPathPoint(layoutId, pathIndex, commandIndex, dx, dy) {
  const path = pathState[layoutId]?.[pathIndex]
  if (!path) return
  moveOnPathPoint(path.commands, commandIndex, dx, dy)
}
