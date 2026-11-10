/** TWOMUCH.STUDIO–inspired motion tokens (Framer / motion-v). */

export const spring = {
  type: 'spring',
  stiffness: 500,
  damping: 50,
}

export const springLayout = {
  ...spring,
  restDelta: 0.001,
}

export const softSpring = {
  type: 'spring',
  stiffness: 100,
  damping: 50,
}

export const fade = { duration: 0.3 }
export const fadeMedium = { duration: 0.5 }
export const wipe = { duration: 0.15 }

export const viewMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: fade,
}

export const chromeEnter = {
  initial: { y: 32, x: '-50%' },
  animate: { y: 0, x: '-50%' },
  transition: spring,
}
