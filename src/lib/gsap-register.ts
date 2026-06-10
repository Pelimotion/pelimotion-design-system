/**
 * GSAP Plugin Registration — Single Entry Point
 * 
 * Import this module ONCE at application root (main.tsx).
 * All GSAP plugins must be registered here to prevent
 * duplicate registration and ensure tree-shaking works correctly.
 */
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { CustomWiggle } from 'gsap/CustomWiggle'
import { CustomBounce } from 'gsap/CustomBounce'
import { SplitText } from 'gsap/SplitText'

// Register all plugins in a single call
gsap.registerPlugin(CustomEase, CustomWiggle, CustomBounce, SplitText)

// ─── Pre-register Named Eases from Config ────────────────────────────────────
// These map the global-motion.json easing paths to named GSAP eases
// so any timeline can reference them by string name.

import globalMotion from '@/config/global-motion.json'

const easingEntries = Object.entries(globalMotion.easing) as [string, string][]

for (const [name, path] of easingEntries) {
  CustomEase.create(name, path)
}

// Export gsap instance for convenience (optional, can import from 'gsap' directly)
export { gsap }

// Log registration confirmation in dev mode
if (import.meta.env.DEV) {
  console.log(
    '%c[GSAP] Plugins registered: CustomEase, CustomWiggle, CustomBounce, SplitText',
    'color: #00d4ff; font-weight: bold;'
  )
  console.log(
    `%c[GSAP] Custom eases loaded: ${easingEntries.map(([n]) => n).join(', ')}`,
    'color: #888;'
  )
}
