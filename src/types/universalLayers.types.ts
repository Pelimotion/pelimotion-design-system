/**
 * Universal Layer Types — Pelimotion v3.0
 *
 * Unified layer system that combines Typography and Element (Generative)
 * layers into a single, flat, ordered list. Both types share the same
 * transform, animation, and visibility primitives.
 */

// ─── Layer Types ─────────────────────────────────────────────────────────────

export type UniversalLayerType =
  | 'text'           // Typography layer
  | 'element'        // SVG/Shape element (was "generative")
  | 'overlay'        // Gradient overlay for social media
  | 'shadow-guard'   // Text protection shadow/gradient
  | 'text-box';      // Background box behind text

// ─── Transform (shared across all layer types) ──────────────────────────────

export interface UniversalTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  /** Width of the bounding box (optional, auto-computed) */
  width?: number;
  /** Height of the bounding box (optional, auto-computed) */
  height?: number;
}

// ─── Animation Presets ───────────────────────────────────────────────────────

export type AnimationEntryPreset =
  | 'none'
  | 'fadeIn'
  | 'fadeUp'
  | 'fadeDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'rotateIn'
  | 'blurIn'
  | 'bounceIn'
  | 'elasticWhip'
  | 'elegantWipe'
  | 'kineticChop'
  | 'typewriter'    // text only
  | 'reveal';

export type AnimationExitPreset =
  | 'none'
  | 'fadeOut'
  | 'fadeUp'
  | 'fadeDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleOut'
  | 'rotateOut'
  | 'blurOut'
  | 'bounceOut'
  | 'elasticSnap'
  | 'dissolve';

export type AutoAnimatePreset =
  | 'float'
  | 'pulse'
  | 'wiggle'
  | 'breathe'
  | 'bounce'
  | 'drift'
  | 'orbit'
  | 'shake';

// ─── Animation Configuration ────────────────────────────────────────────────

export interface UniversalAnimation {
  // ── Entry ─────────────────────────────────────────────────────────────
  entryPreset: AnimationEntryPreset;
  entryDuration: number;    // seconds
  entryDelay: number;       // seconds
  entryEase: string;        // GSAP ease string

  // ── Exit ──────────────────────────────────────────────────────────────
  exitPreset: AnimationExitPreset;
  exitDuration: number;
  exitDelay: number;
  exitEase: string;

  // ── Auto-Animate (continuous loop) ────────────────────────────────────
  autoAnimate: boolean;
  autoAnimatePreset: AutoAnimatePreset;
  /** 0-100 — controls speed and amplitude proportionally */
  autoAnimateIntensity: number;
}

// ─── Text-Specific Data ──────────────────────────────────────────────────────

export interface TextLayerData {
  text: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;         // rem
  letterSpacing: number;    // em
  lineHeight: number;
  textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  maxWidth: number;         // percentage of canvas

  // ── Trail Effect (advanced — hidden in free by default) ────────────────
  trailEnabled: boolean;
  trailInstances: number;
  trailStaggerDelay: number;
  trailBlendMode: string;
  trailOpacityDecay: number;
  trailColor: string;
  trailStyle: 'solid' | 'stroke' | 'blur' | 'chromatic';

  // ── Split & Stagger (advanced) ─────────────────────────────────────────
  splitMode: 'chars' | 'words' | 'lines' | 'none';
  staggerFrom: 'start' | 'end' | 'center' | 'edges' | 'random';
  entryStagger: number;
  exitStagger: number;
}

// ─── Element-Specific Data ───────────────────────────────────────────────────

export type ElementShapeType =
  | 'raw'          // Uploaded SVG
  | 'circle'
  | 'square'
  | 'star'
  | 'grid'
  | 'wave'
  | 'spirograph'
  | 'orbital'
  | 'hexagon'
  | 'mesh'
  | 'concentric'
  | 'fluid'
  | 'particles'
  | 'moire';

export type ElementColorMode = 'original' | 'solid' | 'duotone' | 'tritone';

export interface ElementLayerData {
  shapeType: ElementShapeType;
  /** Raw SVG string (when shapeType === 'raw') */
  svgString?: string;
  /** Color mode */
  colorMode: ElementColorMode;
  /** Colors array (1 for solid, 2 for duotone, 3 for tritone) */
  colors: string[];
  /** Whether noise targets group or individual paths */
  targetMode: 'group' | 'paths';
  /** How opacity is driven */
  opacityMode: 'fixed' | 'wiggle-group' | 'wiggle-paths';
  /** Dynamic shape parameters (for built-in shapes) */
  shapeProps?: Record<string, any>;
  /** Noise engine parameters (advanced) */
  noiseAmplitude: number;
  noiseFrequency: number;
  noiseOctaves: number;
  noisePersistence: number;
}

// ─── Overlay-Specific Data ───────────────────────────────────────────────────

export type OverlayStyle =
  | 'gradient-top'
  | 'gradient-bottom'
  | 'gradient-radial'
  | 'noise-overlay'
  | 'grain-overlay'
  | 'light-leak';

export interface OverlayLayerData {
  overlayStyle: OverlayStyle;
  color: string;
  /** Intensity of the overlay effect (0-100) */
  intensity: number;
}

// ─── Shadow Guard Data ───────────────────────────────────────────────────────

export type ShadowGuardStyle =
  | 'text-protection-bottom'
  | 'text-protection-top'
  | 'vignette-soft'
  | 'vignette-hard';

export interface ShadowGuardLayerData {
  guardStyle: ShadowGuardStyle;
  color: string;
  intensity: number;    // 0-100
  height: number;       // percentage of canvas height (for top/bottom)
}

// ─── Text Box Data ───────────────────────────────────────────────────────────

export type TextBoxStyle =
  | 'pill-blur'
  | 'rectangle-solid'
  | 'rectangle-glass'
  | 'rounded-dark'
  | 'rounded-light';

export interface TextBoxLayerData {
  boxStyle: TextBoxStyle;
  backgroundColor: string;
  borderRadius: number;     // px
  padding: number;          // px
  blur: number;             // px (for glass effects)
  borderColor: string;
  borderWidth: number;
}

// ─── Universal Layer (Discriminated Union) ───────────────────────────────────

export interface UniversalLayer {
  id: string;
  name: string;
  type: UniversalLayerType;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  transform: UniversalTransform;
  animation: UniversalAnimation;

  // Type-specific data (only one will be present based on `type`)
  textData?: TextLayerData;
  elementData?: ElementLayerData;
  overlayData?: OverlayLayerData;
  shadowGuardData?: ShadowGuardLayerData;
  textBoxData?: TextBoxLayerData;
}

// ─── Default Factories ───────────────────────────────────────────────────────

export const DEFAULT_TRANSFORM: UniversalTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
};

export const DEFAULT_ANIMATION: UniversalAnimation = {
  entryPreset: 'fadeIn',
  entryDuration: 0.6,
  entryDelay: 0,
  entryEase: 'power2.out',
  exitPreset: 'fadeOut',
  exitDuration: 0.4,
  exitDelay: 0,
  exitEase: 'power2.in',
  autoAnimate: false,
  autoAnimatePreset: 'float',
  autoAnimateIntensity: 50,
};

export function createTextLayer(overrides?: Partial<UniversalLayer> & { textData?: Partial<TextLayerData> }): UniversalLayer {
  const { textData, ...restOverrides } = overrides || {};
  return {
    id: crypto.randomUUID(),
    name: 'Novo Texto',
    type: 'text',
    visible: true,
    locked: false,
    zIndex: 0,
    transform: { ...DEFAULT_TRANSFORM },
    animation: { ...DEFAULT_ANIMATION, entryPreset: 'fadeUp' },
    textData: {
      text: 'Seu texto aqui',
      fontFamily: 'Inter',
      fontWeight: 700,
      fontSize: 4,
      letterSpacing: -0.02,
      lineHeight: 1.1,
      textTransform: 'uppercase',
      fontStyle: 'normal',
      color: '#ffffff',
      textAlign: 'center',
      maxWidth: 90,
      trailEnabled: false,
      trailInstances: 3,
      trailStaggerDelay: 0.08,
      trailBlendMode: 'screen',
      trailOpacityDecay: 0.3,
      trailColor: '#7c3aed',
      trailStyle: 'solid',
      splitMode: 'chars',
      staggerFrom: 'start',
      entryStagger: 0.03,
      exitStagger: 0.02,
      ...textData,
    },
    ...restOverrides,
  };
}

export function createElementLayer(overrides?: Partial<UniversalLayer> & { elementData?: Partial<ElementLayerData> }): UniversalLayer {
  const { elementData, ...restOverrides } = overrides || {};
  return {
    id: crypto.randomUUID(),
    name: 'Novo Elemento',
    type: 'element',
    visible: true,
    locked: false,
    zIndex: 0,
    transform: { ...DEFAULT_TRANSFORM },
    animation: { ...DEFAULT_ANIMATION },
    elementData: {
      shapeType: 'circle',
      colorMode: 'solid',
      colors: ['#a78bfa'],
      targetMode: 'group',
      opacityMode: 'fixed',
      noiseAmplitude: 20,
      noiseFrequency: 0.5,
      noiseOctaves: 2,
      noisePersistence: 0.5,
      ...elementData,
    },
    ...restOverrides,
  };
}

export function createOverlayLayer(style: OverlayStyle = 'gradient-bottom'): UniversalLayer {
  return {
    id: crypto.randomUUID(),
    name: `Overlay — ${style}`,
    type: 'overlay',
    visible: true,
    locked: false,
    zIndex: 0,
    transform: { ...DEFAULT_TRANSFORM },
    animation: { ...DEFAULT_ANIMATION, entryPreset: 'fadeIn', exitPreset: 'fadeOut' },
    overlayData: {
      overlayStyle: style,
      color: '#000000',
      intensity: 60,
    },
  };
}

export function createShadowGuardLayer(style: ShadowGuardStyle = 'text-protection-bottom'): UniversalLayer {
  return {
    id: crypto.randomUUID(),
    name: `Proteção — ${style}`,
    type: 'shadow-guard',
    visible: true,
    locked: false,
    zIndex: 0,
    transform: { ...DEFAULT_TRANSFORM },
    animation: { ...DEFAULT_ANIMATION, entryPreset: 'fadeIn' },
    shadowGuardData: {
      guardStyle: style,
      color: '#000000',
      intensity: 70,
      height: 40,
    },
  };
}

export function createTextBoxLayer(style: TextBoxStyle = 'rounded-dark'): UniversalLayer {
  return {
    id: crypto.randomUUID(),
    name: `Box — ${style}`,
    type: 'text-box',
    visible: true,
    locked: false,
    zIndex: 0,
    transform: { ...DEFAULT_TRANSFORM },
    animation: { ...DEFAULT_ANIMATION },
    textBoxData: {
      boxStyle: style,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 12,
      padding: 24,
      blur: 0,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    },
  };
}
