const COMMAND_RE = /[MmZzLlHhVvCcSsQqTtAa]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g

function readNumber(tokens, index) {
  return { value: +tokens[index], next: index + 1 }
}

export function parsePathD(d) {
  const tokens = d.match(COMMAND_RE) ?? []
  const commands = []
  let i = 0
  let cmd = null
  let cx = 0
  let cy = 0
  let sx = 0
  let sy = 0

  while (i < tokens.length) {
    const token = tokens[i]
    if (/^[A-Za-z]$/.test(token)) {
      cmd = token
      i += 1
    } else if (!cmd) {
      i += 1
      continue
    } else {
      // implicit repeat of L after M
      if (cmd === 'M') cmd = 'L'
      if (cmd === 'm') cmd = 'l'
    }

    const upper = cmd.toUpperCase()

    if (upper === 'Z') {
      commands.push({ type: 'Z' })
      cx = sx
      cy = sy
      cmd = null
      continue
    }

    if (upper === 'M' || upper === 'L') {
      const x = readNumber(tokens, i)
      const y = readNumber(tokens, x.next)
      i = y.next
      cx = x.value
      cy = y.value
      if (upper === 'M') {
        sx = cx
        sy = cy
      }
      commands.push({ type: upper, x: cx, y: cy })
      continue
    }

    if (upper === 'H') {
      const x = readNumber(tokens, i)
      i = x.next
      cx = x.value
      commands.push({ type: 'L', x: cx, y: cy })
      continue
    }

    if (upper === 'V') {
      const y = readNumber(tokens, i)
      i = y.next
      cy = y.value
      commands.push({ type: 'L', x: cx, y: cy })
      continue
    }

    if (upper === 'C') {
      const x1 = readNumber(tokens, i)
      const y1 = readNumber(tokens, x1.next)
      const x2 = readNumber(tokens, y1.next)
      const y2 = readNumber(tokens, x2.next)
      const x = readNumber(tokens, y2.next)
      const y = readNumber(tokens, x.next)
      i = y.next
      cx = x.value
      cy = y.value
      commands.push({
        type: 'C',
        x1: x1.value,
        y1: y1.value,
        x2: x2.value,
        y2: y2.value,
        x: cx,
        y: cy,
      })
      continue
    }

    if (upper === 'Q') {
      const x1 = readNumber(tokens, i)
      const y1 = readNumber(tokens, x1.next)
      const x = readNumber(tokens, y1.next)
      const y = readNumber(tokens, x.next)
      i = y.next
      cx = x.value
      cy = y.value
      commands.push({ type: 'Q', x1: x1.value, y1: y1.value, x: cx, y: cy })
      continue
    }

    // Skip uncommon commands — keep raw segment if needed
    i += 1
  }

  return commands
}

export function commandsToPathD(commands) {
  return commands
    .map((cmd) => {
      switch (cmd.type) {
        case 'M':
          return `M ${cmd.x} ${cmd.y}`
        case 'L':
          return `L ${cmd.x} ${cmd.y}`
        case 'H':
          return `H ${cmd.x}`
        case 'V':
          return `V ${cmd.y}`
        case 'C':
          return `C ${cmd.x1} ${cmd.y1} ${cmd.x2} ${cmd.y2} ${cmd.x} ${cmd.y}`
        case 'Q':
          return `Q ${cmd.x1} ${cmd.y1} ${cmd.x} ${cmd.y}`
        case 'Z':
          return 'Z'
        default:
          return ''
      }
    })
    .join(' ')
}

export function getPathHandles(commands) {
  const handles = []

  commands.forEach((cmd, commandIndex) => {
    if (cmd.type !== 'M' && cmd.type !== 'L' && cmd.type !== 'C' && cmd.type !== 'Q') return
    if (handles.some((handle) => Math.hypot(handle.x - cmd.x, handle.y - cmd.y) < 0.05)) return
    handles.push({
      commandIndex,
      x: cmd.x,
      y: cmd.y,
    })
  })

  return handles
}

function shiftAnchor(commands, commandIndex, dx, dy) {
  const cmd = commands[commandIndex]
  cmd.x += dx
  cmd.y += dy

  if (cmd.type === 'C') {
    cmd.x2 += dx
    cmd.y2 += dy
  } else if (cmd.type === 'Q') {
    cmd.x1 += dx
    cmd.y1 += dy
  }

  const next = commands[commandIndex + 1]
  if (next?.type === 'C' || next?.type === 'Q') {
    next.x1 += dx
    next.y1 += dy
  }
}

/** Move an on-path point in any direction, keeping its curve handles attached. */
export function moveOnPathPoint(commands, commandIndex, dx, dy) {
  const cmd = commands[commandIndex]
  if (!cmd || !('x' in cmd) || !('y' in cmd)) return

  const originX = cmd.x
  const originY = cmd.y
  commands.forEach((other, index) => {
    if (!('x' in other) || !('y' in other)) return
    if (Math.hypot(other.x - originX, other.y - originY) > 0.05) return
    shiftAnchor(commands, index, dx, dy)
  })
}

export function clientDeltaToSvg(svgEl, dxClient, dyClient) {
  if (!svgEl) return { dx: dxClient, dy: dyClient }
  const ctm = svgEl.getScreenCTM()
  if (!ctm) return { dx: dxClient, dy: dyClient }
  const scaleX = Math.hypot(ctm.a, ctm.b)
  const scaleY = Math.hypot(ctm.c, ctm.d)
  return { dx: dxClient / scaleX, dy: dyClient / scaleY }
}
