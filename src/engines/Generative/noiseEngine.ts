/**
 * Noise Engine — Phase 3 (Updated for Per-Property Posterize)
 *
 * Maps Simplex Noise 2D/3D to GSAP transform variables, driving organic
 * motion on SVG paths. Uses the `simplex-noise` v4 API.
 */
import { gsap } from 'gsap'
import { createNoise2D, createNoise3D } from 'simplex-noise'
import type { WiggleConfig, NoiseChannel } from '@/types/motion.types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoiseDriverConfig extends WiggleConfig {
  /** Which transform channels to drive */
  channels: NoiseChannel[]
  /** Color of SVG elements (CSS string, e.g. '#00d4ff') */
  color?: string
}

export { type NoiseChannel }

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

function getPosterizedTime(elapsed: number, fps: number | undefined): number {
  if (!fps) return elapsed;
  return Math.floor(elapsed * fps) / fps;
}

// ─── Driver Factory ───────────────────────────────────────────────────────────

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
    propertyFps,
  } = config

  const prng = mulberry32(seed)
  const noise2D = createNoise2D(prng)
  const prng3D = mulberry32(seed + 999)
  const noise3D = createNoise3D(prng3D)

  let running = false
  let startTime = 0
  let ownTickerActive = false

  function tick(time: number) {
    if (!running) return

    const elapsed = time - startTime

    targets.forEach((target, i) => {
      const offsetX = i * 3.7
      const offsetY = i * 2.3

      const props: gsap.TweenVars = {}

      if (channels.includes('x')) {
        const t = getPosterizedTime(elapsed, propertyFps?.x);
        const nx = noiseType === 'simplex2D'
          ? fbm2D(noise2D, t * frequency + offsetX, 0, octaves, persistence)
          : fbm2D((x, y) => noise3D(x, y, offsetY), t * frequency + offsetX, 0, octaves, persistence)
        props.x = nx * amplitude
      }

      if (channels.includes('y')) {
        const t = getPosterizedTime(elapsed, propertyFps?.y);
        const ny = noiseType === 'simplex2D'
          ? fbm2D(noise2D, 0, t * frequency + offsetY, octaves, persistence)
          : fbm2D((x, y) => noise3D(x, offsetX, y), 0, t * frequency + offsetY, octaves, persistence)
        props.y = ny * amplitude * 0.6
      }

      if (channels.includes('rotation')) {
        const t = getPosterizedTime(elapsed, propertyFps?.rotation);
        const nr = fbm2D(noise2D, t * frequency * 0.5 + offsetX + 10, offsetY + 5, octaves, persistence)
        props.rotation = nr * amplitude * 0.8
      }

      if (channels.includes('scale')) {
        const t = getPosterizedTime(elapsed, propertyFps?.scale);
        const ns = fbm2D(noise2D, offsetX + 20, t * frequency * 0.3 + offsetY + 7, octaves, persistence)
        props.scale = 1 + ns * 0.12 * (amplitude / 20)
      }
      
      if (channels.includes('scaleX')) {
        const t = getPosterizedTime(elapsed, propertyFps?.scaleX);
        const nsX = fbm2D(noise2D, offsetX + 25, t * frequency * 0.3 + offsetY + 11, octaves, persistence)
        props.scaleX = 1 + nsX * 0.12 * (amplitude / 20)
      }
      
      if (channels.includes('scaleY')) {
        const t = getPosterizedTime(elapsed, propertyFps?.scaleY);
        const nsY = fbm2D(noise2D, offsetX + 30, t * frequency * 0.3 + offsetY + 14, octaves, persistence)
        props.scaleY = 1 + nsY * 0.12 * (amplitude / 20)
      }
      
      if (channels.includes('skew')) {
        const t = getPosterizedTime(elapsed, propertyFps?.skew);
        const nSk = fbm2D(noise2D, offsetX + 35, t * frequency * 0.4 + offsetY + 18, octaves, persistence)
        props.skewX = nSk * amplitude * 0.5
        props.skewY = nSk * amplitude * 0.2
      }

      if (channels.includes('opacity')) {
        const t = getPosterizedTime(elapsed, propertyFps?.opacity);
        const no = fbm2D(noise2D, t * frequency * 0.2 + offsetX + 50, offsetY + 30, octaves, persistence)
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
      if (!ownTickerActive) {
        ownTickerActive = true
        gsap.ticker.add(tick)
      }
    },
    startHeadless() {
      if (running) return
      running = true
      startTime = gsap.ticker.time
    },
    stop() {
      running = false
      if (ownTickerActive) {
        ownTickerActive = false
        gsap.ticker.remove(tick)
      }
      if (targets.length) {
        gsap.set(targets, { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, opacity: 1, clearProps: 'all' })
      }
    },
    tick,
  }
}
