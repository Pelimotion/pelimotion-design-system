/**
 * Noise Engine — Phase 4 (Web Worker Optimization)
 *
 * Simplex Noise generation is now offloaded to a Web Worker to ensure the
 * main thread remains free for UI rendering, preventing dropped frames
 * during complex generative sequences.
 */
import { gsap } from 'gsap'
import type { WiggleConfig, NoiseChannel } from '@/types/motion.types'
import NoiseWorker from './noiseWorker?worker'

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

// ─── Driver Factory ───────────────────────────────────────────────────────────

export function createNoiseDriver(
  targets: Element[],
  config: NoiseDriverConfig
): NoiseDriver {
  let running = false
  let startTime = 0
  let ownTickerActive = false

  // Web Worker Instance
  const worker = new NoiseWorker()
  let latestValues: gsap.TweenVars[] = []

  worker.onmessage = (e) => {
    if (e.data.type === 'RESULT') {
      latestValues = e.data.values
    }
  }

  function tick(time: number) {
    if (!running) return

    const elapsed = time - startTime

    // Dispatch heavy calculations to the Web Worker
    worker.postMessage({
      type: 'CALCULATE',
      payload: {
        elapsed,
        targetsCount: targets.length,
        config
      }
    })

    // Apply the latest available pre-calculated values
    // (This introduces a max 1-frame latency, which is imperceptible for procedural noise)
    if (latestValues.length === targets.length) {
      targets.forEach((target, i) => {
        if (latestValues[i]) gsap.set(target, latestValues[i]);
      })
    }
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
      worker.terminate()
      if (targets.length) {
        gsap.set(targets, { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, opacity: 1, clearProps: 'x,y,rotation,scale,scaleX,scaleY,skewX,skewY,opacity,transform' })
      }
    },
    tick,
  }
}
