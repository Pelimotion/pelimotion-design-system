/**
 * Typographic Engine — Timeline Factory
 * 
 * Generates highly optimized GSAP timelines for typographical motion.
 * Maps parameters (position, scale, opacity, blur, easings) to split DOM elements.
 */
import { gsap } from 'gsap'

export interface TypographyAnimOptions {
  duration?: number;
  stagger?: number;
  ease?: string;
  xOffset?: number;
  yOffset?: number;
  scale?: number;
  blur?: number;
  opacityStart?: number;
  isExit?: boolean;
}

/**
 * Creates a GSAP timeline to animate typography nodes from a specified starting state
 * back to their natural layout positions.
 * 
 * @param targets The DOM nodes split by SplitText to animate
 * @param options Timing, easing, and spatial/blur parameters
 * @returns GSAP Timeline instance
 */
export function createTypographyTimeline(
  targets: gsap.DOMTarget,
  options: TypographyAnimOptions = {}
): gsap.core.Timeline {
  const {
    duration = 0.8,
    stagger = 0.03,
    ease = 'entrySmooth',
    xOffset = 0,
    yOffset = 30,
    scale = 0.95,
    blur = 8,
    opacityStart = 0,
    isExit = false,
  } = options

  const tl = gsap.timeline()

  if (isExit) {
    // Animate from pristine state OUT to the target values
    tl.to(targets, {
      opacity: opacityStart,
      x: xOffset,
      y: yOffset,
      scale: scale,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
      duration,
      stagger,
      ease,
    })
  } else {
    // Pre-set starting properties to prevent visual layout jumps
    gsap.set(targets, {
      opacity: opacityStart,
      x: xOffset,
      y: yOffset,
      scale: scale,
      // WebKit sometimes struggles with dynamic filters on split text, 
      // so we apply a standard CSS filter property that works across modern browsers
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
    })

    // Animate to pristine state
    tl.to(targets, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration,
      stagger,
      ease,
      clearProps: 'filter' // Removes the inline filter style once animation completes
    })
  }

  return tl
}
