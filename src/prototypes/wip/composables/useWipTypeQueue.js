let clock = 0

export function resetWipTypeQueue() {
  clock = 0
}

/** Reserve a start time (seconds) so mount-triggered lines type in DOM order. */
export function claimWipTypeDelay(charCount, msPerChar, gapMs = 140) {
  const start = clock
  clock += Math.max(1, charCount) * msPerChar + gapMs
  return start / 1000
}
