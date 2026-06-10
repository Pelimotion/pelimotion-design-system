/**
 * Noise Engine — Phase 3
 *
 * Maps Simplex Noise 2D/3D to GSAP transform variables, driving organic
 * motion on SVG paths. Uses the `simplex-noise` v4 API.
 *
 * Architecture: each "driver" is a self-contained object with start/stop/update
 * methods, making it trivially composable with React's useLayoutEffect cleanup.
 */
import { gsap } from 'gsap'
import { createNoise2D, createNoise3D } from 'simplex-noise'
import type { WiggleConfig } from '@/types/motion.types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoiseDriverConfig extends WiggleConfig {
  /** Which transform channels to drive */
  channels: NoiseChannel[]
  /** Color of SVG elements (CSS string, e.g. '#00d4ff') */
  color?: string
}

export type NoiseChannel = 'x' | 'y' | 'rotation' | 'scale' | 'opacity'

export interface NoiseDriver {
  /** Starts the driver AND registers on gsap.ticker (stand-alone mode) */
  start: () => void
  /** Starts the driver WITHOUT registering on gsap.ticker (caller drives via tick()) */
  startHeadless: () => void
  stop: () => void
  /** Force a single frame update (useful for posterized tick) */
  tick: (time: number) => void
}

// ─── Seeded PRNG (Alea) ───────────────────────────────────────────────────────
// simplex-noise v4 requires a PRNG function rather than a numeric seed.
// We implement a simple Mulberry32 PRNG from an integer seed.

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Fractal Brownian Motion helper ──────────────────────────────────────────

/**
 * Stacks `octaves` layers of noise with decreasing amplitude.
 * Produces richer, more natural-looking motion.
 */
function fbm2D(
  noise2D: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
  persistence: number
): number {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let maxAmplitude = 0

  for (let o = 0; o < octaves; o++) {
    value += noise2D(x * frequency, y * frequency) * amplitude
    maxAmplitude += amplitude
    amplitude *= persistence
    frequency *= 2
  }

  return value / maxAmplitude
}

// ─── Driver Factory ───────────────────────────────────────────────────────────

/**
 * Creates a noise driver that animates a set of SVG targets using Simplex Noise.
 *
 * @param targets  DOM elements to animate (paths, circles, etc.)
 * @param config   Noise + channel configuration from WiggleConfig + extras
 */
export function createNoiseDriver(
  targets: Element[],
  config: NoiseDriverConfig
): NoiseDriver {
  const {
    amplitude,
    frequency,
    octaves,
    persistence,
    noiseType,
    seed,
    channels,
  } = config

  const prng = mulberry32(seed)
  const noise2D = createNoise2D(prng)
  // Reset prng for 3D (different slice of the same seed space)
  const prng3D = mulberry32(seed + 999)
  const noise3D = createNoise3D(prng3D)

  let running = false
  let startTime = 0
  // When true, the driver is registered on gsap.ticker directly (no posterize gating)
  let ownTickerActive = false

  /**
   * Per-frame update: samples noise for each target using its index as
   * a spatial offset, producing independent-but-correlated motion.
   */
  function tick(time: number) {
    if (!running) return

    const elapsed = time - startTime

    targets.forEach((target, i) => {
      // Each target gets a unique noise coordinate based on its index
      const offsetX = i * 3.7
      const offsetY = i * 2.3

      const props: gsap.TweenVars = {}

      if (channels.includes('x')) {
        const nx = noiseType === 'simplex2D'
          ? fbm2D(noise2D, elapsed * frequency + offsetX, 0, octaves, persistence)
          : fbm2D((x, y) => noise3D(x, y, offsetY), elapsed * frequency + offsetX, 0, octaves, persistence)
        props.x = nx * amplitude
      }

      if (channels.includes('y')) {
        const ny = noiseType === 'simplex2D'
          ? fbm2D(noise2D, 0, elapsed * frequency + offsetY, octaves, persistence)
          : fbm2D((x, y) => noise3D(x, offsetX, y), 0, elapsed * frequency + offsetY, octaves, persistence)
        props.y = ny * amplitude * 0.6 // y is slightly calmer
      }

      if (channels.includes('rotation')) {
        const nr = fbm2D(noise2D, elapsed * frequency * 0.5 + offsetX + 10, offsetY + 5, octaves, persistence)
        props.rotation = nr * amplitude * 0.8
      }

      if (channels.includes('scale')) {
        const ns = fbm2D(noise2D, offsetX + 20, elapsed * frequency * 0.3 + offsetY + 7, octaves, persistence)
        props.scale = 1 + ns * 0.12 * (amplitude / 20) // scale is always subtle
      }

      if (channels.includes('opacity')) {
        const no = fbm2D(noise2D, elapsed * frequency * 0.2 + offsetX + 50, offsetY + 30, octaves, persistence)
        props.opacity = 0.5 + no * 0.5 * 0.8
      }

      gsap.set(target, props)
    })
  }

  return {
    start() {
      if (running) return
      running = true
      startTime = gsap.ticker.time
      // Only register on the native ticker if NOT being driven externally
      // (i.e. not routed through registerGatedCallback from posterizeTime)
      if (!ownTickerActive) {
        ownTickerActive = true
        gsap.ticker.add(tick)
      }
    },

    /** Call this when the driver is being driven externally (e.g. via posterize gating) */
    startHeadless() {
      if (running) return
      running = true
      startTime = gsap.ticker.time
      // Do NOT register on gsap.ticker — caller will invoke tick() directly
    },

    stop() {
      running = false
      if (ownTickerActive) {
        ownTickerActive = false
        gsap.ticker.remove(tick)
      }
      // Reset transforms
      if (targets.length) {
        gsap.set(targets, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, clearProps: 'all' })
      }
    },

    tick,
  }
}
