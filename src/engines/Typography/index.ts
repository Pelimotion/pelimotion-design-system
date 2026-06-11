/**
 * Typographic Engine — v2
 * 
 * Professional-grade kinetic typography system:
 * - Dual-layer architecture (Title + Subtitle)
 * - 10+ animation presets (entry + exit)
 * - Custom property animation (x, y, scale, rotation, blur, opacity, skew)
 * - Advanced stagger modes
 * - Master timeline orchestration
 * - GSAP Draggable for direct manipulation
 * - Layout engine with 6 arrangement modes
 */

export { TypographyPreview } from './TypographyPreview'
export {
  createTypographyTimeline,
  createEntryTimeline,
  createExitTimeline,
  createIdleTimeline,
  createLayerTimeline,
  createMasterTimeline,
  getEntryPresetValues,
  getExitPresetValues,
} from './typography.engine'
export type {
  TypographyAnimOptions,
  AnimProps,
  LayerTimelineOptions,
  MasterTimelineOptions,
} from './typography.engine'
