/**
 * Generative SVG Engine — Phase 3 Exports
 */
export { SVG_CATALOG, fetchSVGElement, injectSVGIntoContainer, getAnimatableTargets, loadSVG } from './svgInjector'
export type { SVGAsset } from './svgInjector'

export { createNoiseDriver } from './noiseEngine'
export type { NoiseDriverConfig, NoiseDriver, NoiseChannel } from './noiseEngine'

export { startPosterize, stopPosterize, registerGatedCallback, isPosterizeActive, getPosterizeFps } from './posterizeTime'
