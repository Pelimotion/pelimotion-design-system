/**
 * Typographic Engine — Phase 2
 * 
 * This module will handle:
 * - GSAP SplitText initialization and lifecycle (revert on cleanup)
 * - Timeline Factory for character/word/line animations
 * - Trail Effect: DOM cloning with staggered GSAP delays
 * - Aggressive garbage collection via gsap.context()
 */

export { TypographyPreview } from './TypographyPreview'
export { createTypographyTimeline } from './typography.engine'
export type { TypographyAnimOptions } from './typography.engine'
