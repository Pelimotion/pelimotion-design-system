/**
 * PosterizeTime — Phase 3
 *
 * Overrides the GSAP global ticker to clamp frame delivery to a target FPS,
 * producing the stop-motion / craft animation aesthetic.
 *
 * ISOLATION STRATEGY:
 * GSAP's ticker drives ALL animations globally. Rather than throttle the
 * entire ticker (which would break UI interactions), we use a per-tick
 * accumulator that gates manual `gsap.set()` calls in the noise engine
 * while leaving GSAP tweens (UI, transitions) unaffected.
 *
 * This matches the pattern used by GSAP's own posterize demos and by
 * Lottie/Rive when rendering at reduced frame rates.
 */
import { gsap } from 'gsap'

// ─── State ────────────────────────────────────────────────────────────────────

let posterizeActive = false
let targetFps = 12
let lastTick = 0
let accumulatedDelta = 0

/**
 * Frame-gate callbacks — these are called only when a posterized frame is due.
 * The noise engine registers its tick function here when posterize is active.
 */
const gatedCallbacks = new Set<(time: number) => void>()

// The master ticker function, added once and never removed while the app lives
let masterTickerInstalled = false

function masterTick(_time: number, _deltaTime: number, frame: number) {
  if (!posterizeActive) {
    // Pass-through — gated callbacks fire every native frame
    const now = gsap.ticker.time
    gatedCallbacks.forEach((cb) => cb(now))
    lastTick = now
    return
  }

  const now = gsap.ticker.time
  const frameInterval = 1 / targetFps
  accumulatedDelta += now - lastTick
  lastTick = now

  // Only dispatch if enough time has passed for the next posterized frame
  if (accumulatedDelta >= frameInterval) {
    accumulatedDelta -= frameInterval
    gatedCallbacks.forEach((cb) => cb(now))
  }

  void frame // suppress unused lint
}

function ensureMasterTicker() {
  if (masterTickerInstalled) return
  masterTickerInstalled = true
  lastTick = gsap.ticker.time
  gsap.ticker.add(masterTick)
}

// ─── HMR Cleanup (Vite dev only) ─────────────────────────────────────────────
// In development, Vite hot-reloads modules. Without this, the old masterTick
// function stays registered on the GSAP ticker, causing duplicate callbacks
// and stale closures.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (masterTickerInstalled) {
      gsap.ticker.remove(masterTick)
    }
    gatedCallbacks.clear()
    masterTickerInstalled = false
    posterizeActive = false
    accumulatedDelta = 0
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Starts the posterize effect at the given FPS.
 * All registered gated callbacks will fire at this reduced rate.
 */
export function startPosterize(fps: number) {
  targetFps = Math.max(1, Math.min(fps, 60))
  accumulatedDelta = 0
  posterizeActive = true
  ensureMasterTicker()
  console.log(`%c[PosterizeTime] Active @ ${targetFps}fps`, 'color:#ffaa00;font-weight:bold')
}

/**
 * Disables the posterize gate — gated callbacks resume firing at native fps.
 */
export function stopPosterize() {
  posterizeActive = false
  accumulatedDelta = 0
  console.log('%c[PosterizeTime] Disabled — native fps', 'color:#00cc88;font-weight:bold')
}

/**
 * Registers a callback to be gated by the posterize mechanism.
 * When posterize is OFF, the callback fires every native frame.
 * When ON, it fires only at the target FPS.
 *
 * @returns cleanup function — call in useLayoutEffect's return or on unmount
 */
export function registerGatedCallback(
  cb: (time: number) => void
): () => void {
  ensureMasterTicker()
  gatedCallbacks.add(cb)
  return () => { gatedCallbacks.delete(cb) }
}

/**
 * Returns whether posterize is currently active.
 */
export function isPosterizeActive(): boolean {
  return posterizeActive
}

/**
 * Returns the current target FPS.
 */
export function getPosterizeFps(): number {
  return targetFps
}
