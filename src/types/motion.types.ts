/**
 * Pelimotion Design System — Type Definitions
 * 
 * Strict interfaces mirroring the JSON configuration files.
 * These types are the contract between the headless config layer
 * and the runtime motion engines.
 */

// ─── Easing Configuration ────────────────────────────────────────────────────

/** GSAP CustomEase SVG path strings — NO linear motion allowed */
export interface EasingConfig {
  /** Smooth entry: expo.out curve */
  entrySmooth: string;
  /** Sharp exit: expo.in curve */
  exitSharp: string;
  /** Elastic overshoot */
  elastic: string;
  /** Bounce settle */
  bounceOut: string;
  /** Micro-interaction: subtle ease-in-out */
  microInteraction: string;
}

// ─── PosterizeTime Configuration ─────────────────────────────────────────────

export interface PosterizeTimeConfig {
  /** Default posterized framerate (e.g., 12fps for stop-motion feel) */
  masterFps: number;
  /** When true, UI elements bypass the posterize ticker */
  uiBypass: boolean;
  /** Selectable framerate presets */
  availableRates: readonly number[];
}

// ─── Trail Effect Configuration ──────────────────────────────────────────────

export interface TrailConfig {
  /** Master on/off switch for the trail effect */
  enabled: boolean;
  /** Number of cloned DOM nodes for the trail echo */
  instances: number;
  /** Seconds between each trail echo */
  staggerDelay: number;
  /** Delay between main typography entry and trail entry (seconds) */
  mainEntryDelay: number;
  /** CSS mix-blend-mode for trail clones */
  blendMode: string;
  /** Opacity reduction per trail instance (0-1) */
  opacityDecay: number;
  /** Scale reduction per trail instance */
  scaleDecay: number;
  /** Gaussian blur increment per instance (px) */
  blurIncrement: number;
  /** Render trail elements as outline/stroke only (legacy) */
  strokeOnly: boolean;
  /** Advanced trail aesthetic style */
  style: 'solid' | 'stroke' | 'blur' | 'chromatic';
  /** Trail specific color (independent from main text) */
  trailColor: string;
  /** Trail behavior mode */
  trailMode: 'persistent' | 'leading';
  /** Trail letter-spacing offset relative to main (em) */
  trailLetterSpacing: number;
  /** Trail vertical offset (px) — displaces the whole echo relative to main */
  trailOffsetY: number;
  /** Trail horizontal offset (px) */
  trailOffsetX: number;
  /** Trail scale multiplier relative to main */
  trailScaleMultiplier: number;
  /** Trail rotation in degrees */
  trailRotation: number;
}


// ─── Wiggle / Noise Configuration ────────────────────────────────────────────

export type NoiseType = 'simplex2D' | 'simplex3D' | 'simplex4D';

export interface WiggleConfig {
  /** Maximum displacement in pixels */
  amplitude: number;
  /** Noise sampling frequency (lower = smoother) */
  frequency: number;
  /** Fractal Brownian Motion layers */
  octaves: number;
  /** FBM persistence (amplitude decay per octave) */
  persistence: number;
  /** Noise algorithm selection */
  noiseType: NoiseType;
  /** Deterministic seed for reproducible motion */
  seed: number;
  /** Property-specific posterize FPS (2, 4, 6, 8, 10). If undefined, uses unposterized time. */
  propertyFps: Partial<Record<NoiseChannel, number>>;
  /** Animation targets: whole SVG container or individual inner layers */
  targetMode: 'group' | 'layers';
  /** Colorization strategy for SVG paths */
  colorMode: 'solid' | 'duotone' | 'tritone';
  /** Selected colors for the generative shape */
  colors: string[];
  /** Property-specific amplitude multipliers (defaults to 1.0) */
  propertyAmplitudes: Partial<Record<NoiseChannel, number>>;
  /** Property-specific frequency multipliers (defaults to 1.0) */
  propertyFrequencies: Partial<Record<NoiseChannel, number>>;
  /** Aspect ratio grid overlay for the infinite canvas */
  previewGrid: 'none' | 'all' | '16:9' | '1:1' | '9:16' | '4:5';
}

// ─── Generative Layers ───────────────────────────────────────────────────────

export type GenerativeShapeType = 'raw' | 'circle' | 'square' | 'star' | 'grid' | 'wave' | 'spirograph' | 'orbital' | 'hexagon' | 'mesh' | 'concentric' | 'fluid' | 'particles' | 'moire';

/**
 * How the layer's SVG elements are colorized.
 * 'original' = preserve the SVG's own colors (no override)
 * 'solid'    = all elements get one solid fill
 * 'duotone'  = elements alternate between 2 colors
 * 'tritone'  = elements cycle through 3 colors
 */
export type LayerColorMode = 'original' | 'solid' | 'duotone' | 'tritone';

/**
 * Which DOM nodes the noise engine animates for this layer.
 * 'group' = the layer wrapper element as a whole
 * 'paths' = each individual SVG child element
 */
export type LayerTargetMode = 'group' | 'paths';

/**
 * How opacity is handled for this layer.
 * 'fixed'         = use the static transform.opacity slider
 * 'wiggle-group'  = the entire layer wrapper opacity is noise-driven
 * 'wiggle-paths'  = each individual SVG path has independent noise-driven opacity
 */
export type LayerOpacityMode = 'fixed' | 'wiggle-group' | 'wiggle-paths';

export interface LayerTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface GenerativeLayer {
  id: string;
  name: string;
  type: GenerativeShapeType;
  /** Used when type === 'raw' */
  svgString?: string;
  transform: LayerTransform;
  /** Dynamic parameters for built-in shapes */
  shapeProps?: any;
  // ── Per-Layer Appearance ──────────────────────────────────────────────────
  /** Color strategy for this layer's SVG elements. Default: 'original' */
  colorMode: LayerColorMode;
  /** Colors to use for solid/duotone/tritone modes. Default: ['#a78bfa'] */
  colors: string[];
  /** Whether noise engine targets the group or individual paths. Default: 'group' */
  targetMode: LayerTargetMode;
  /** How opacity is animated. Default: 'fixed' */
  opacityMode: LayerOpacityMode;
  // ── Per-Layer Animation ───────────────────────────────────────────────────
  /** Individual wiggle/noise configuration for this layer */
  wiggle?: Partial<WiggleConfig>;
  /** Entry and Exit animation definitions */
  animation?: {
    entryPreset: string;
    entryDuration: number;
    exitPreset: string;
    exitDuration: number;
  };
}

// ─── Canvas / Export Configuration ───────────────────────────────────────────

export interface CaptureResolution {
  width: number;
  height: number;
}

export interface CanvasConfig {
  /** Output video resolution */
  captureResolution: CaptureResolution;
  /** Capture framerate for DOM-to-Canvas pipeline */
  captureFps: number;
  /** MUST be rgba(0,0,0,0) for alpha channel preservation */
  backgroundColor: string;
}

// ─── Typography Layer System ─────────────────────────────────────────────────

/** Spatial transform for a typography layer (position, scale, rotation on canvas) */
export interface TypoLayerTransform {
  /** Horizontal position offset from layout center (px) */
  x: number;
  /** Vertical position offset from layout center (px) */
  y: number;
  /** Scale multiplier (1.0 = 100%) */
  scale: number;
  /** Rotation in degrees */
  rotation: number;
  /** Layer opacity (0–1) */
  opacity: number;
  /** Width of the bounding box */
  textBoxWidth?: number;
  /** Height of the bounding box */
  textBoxHeight?: number;
}

/** Animation preset names for entry transitions */
export type EntryPreset = 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'scaleIn'
  | 'rotateIn' | 'blurIn' | 'typewriter' | 'elastic' | 'glitch' | 'reveal' | 'splitFlip' | 'custom'
  | 'brutalSlam' | 'blurStretch' | 'elegantWipe' | 'kineticChop' | 'bounceIn' | 'elasticWhip';

/** Animation preset names for exit transitions */
export type ExitPreset = 'fadeUp' | 'fadeDown' | 'slideLeft' | 'slideRight' | 'scaleOut'
  | 'rotateOut' | 'blurOut' | 'dissolve' | 'reveal' | 'custom'
  | 'brutalSlam' | 'blurStretch' | 'elegantWipe' | 'kineticChop' | 'bounceOut' | 'elasticSnap';

/** Direction from which stagger cascades */
export type StaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';

/** SplitText granularity for animation */
export type SplitMode = 'chars' | 'words' | 'lines' | 'none';

/** Idle motion style during hold time */
export type IdleMotionType = 'none' | 'scaleUp' | 'panX' | 'panY' | 'float' | 'breathe' | 'wiggle';

/** Full animation configuration for a single typography layer */
export interface TypoLayerAnimation {
  // ── Entry ───────────────────────────────────────────────────────────────
  /** Named preset for entry animation */
  entryPreset: EntryPreset;
  /** Entry duration (seconds) */
  entryDuration: number;
  /** Entry stagger between split elements (seconds) */
  entryStagger: number;
  /** Entry easing curve (EasingConfig key) */
  entryEase: string;
  /** Delay before this layer starts animating (seconds) */
  entryDelay: number;
  /** How text is split for animation */
  splitMode: SplitMode;
  /** Stagger cascade direction */
  staggerFrom: StaggerFrom;

  // ── Entry Custom Properties (used when entryPreset === 'custom') ────────
  /** Starting X offset (px) */
  entryX: number;
  /** Starting Y offset (px) */
  entryY: number;
  /** Starting scale */
  entryScale: number;
  /** Starting rotation (degrees) */
  entryRotation: number;
  /** Starting blur (px) */
  entryBlur: number;
  /** Starting opacity */
  entryOpacity: number;
  /** Starting skewX (degrees) */
  entrySkewX: number;
  /** Starting skewY (degrees) */
  entrySkewY: number;

  // ── Exit ────────────────────────────────────────────────────────────────
  /** Named preset for exit animation */
  exitPreset: ExitPreset;
  /** Exit duration (seconds) */
  exitDuration: number;
  /** Exit stagger between split elements (seconds) */
  exitStagger: number;
  /** Exit easing curve */
  exitEase: string;
  /** Delay before exit starts (relative to hold end) */
  exitDelay: number;

  // ── Exit Custom Properties (used when exitPreset === 'custom') ──────────
  /** Target X offset (px) */
  exitX: number;
  /** Target Y offset (px) */
  exitY: number;
  /** Target scale */
  exitScale: number;
  /** Target rotation (degrees) */
  exitRotation: number;
  /** Target blur (px) */
  exitBlur: number;
  /** Target opacity */
  exitOpacity: number;
  /** Target skewX (degrees) */
  exitSkewX: number;
  /** Target skewY (degrees) */
  exitSkewY: number;

  // ── Idle (during timeOnScreen) ──────────────────────────────────────────
  /** Continuous motion type while text is on screen */
  idleMotion: IdleMotionType;
  /** Speed multiplier for idle motion */
  idleSpeed: number;
  /** Amplitude/intensity of idle motion */
  idleIntensity: number;
}

/** A single typography layer */
export interface TypographyLayer {
  /** Layer identifier */
  id: string;
  /** Display name in the UI */
  name: string;
  /** Whether this layer is visible */
  enabled: boolean;
  /** The text content */
  text: string;

  // ── Typographic Properties ──────────────────────────────────────────────
  /** Font family name */
  fontFamily: string;
  /** Font weight (100–900) */
  fontWeight: number;
  /** Font size in rem */
  fontSize: number;
  /** Letter spacing in em */
  letterSpacing: number;
  /** Line height multiplier */
  lineHeight: number;
  /** Text transformation */
  textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  /** Normal or italic */
  fontStyle: 'normal' | 'italic';
  /** Text color */
  color: string;
  /** Text alignment */
  textAlign: 'left' | 'center' | 'right';
  /** Max width as percentage of viewport (controls line wrapping) */
  maxWidth: number;

  // ── Spatial Transform ───────────────────────────────────────────────────
  /** Position, scale, rotation on the canvas */
  transform: TypoLayerTransform;

  // ── Animation ───────────────────────────────────────────────────────────
  /** Full animation configuration */
  animation: TypoLayerAnimation;

  // ── Effects ─────────────────────────────────────────────────────────────
  /** Per-layer trail/echo configuration overrides (optional) */
  trail?: TrailConfig;
}

/** Layout arrangement mode for title + subtitle */
export type TypographyLayoutMode = 'center' | 'stack' | 'sideBySide' | 'diagonal' | 'overlap' | 'freeform' | 'grid';

// ─── Typography Configuration ────────────────────────────────────────────────

export interface TypographyConfig {
  // ── Global Controls ─────────────────────────────────────────────────────
  /** Layout arrangement mode */
  layoutMode: TypographyLayoutMode;
  /** Spacing between layers in px */
  layoutGap: number;
  /** Flex/Grid alignment (cross-axis) */
  layoutAlignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /** Flex/Grid alignment (main-axis) */
  layoutJustifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  /** Global Idle Motion applied to all layers together */
  globalIdleMotion?: IdleMotionType;
  /** How long the text stays on screen after entry before exiting (seconds) */
  timeOnScreen: number;

  // ── Layer Linking ───────────────────────────────────────────────────────
  /** When true, dragging one layer moves both */
  linkPosition: boolean;
  /** When true, entry/exit timelines are synchronized */
  linkAnimation: boolean;

  // ── Layers ──────────────────────────────────────────────────────────────
  /** Array of dynamic typography layers */
  layers: TypographyLayer[];

  // ── Legacy Fields (backward compat with Trail engine) ───────────────────
  /** @deprecated Use titleLayer.animation.splitMode */
  splitMode: string;
  /** @deprecated Use titleLayer.animation.entryStagger */
  defaultStagger: number;
  /** @deprecated Use titleLayer.animation.entryDuration */
  defaultDuration: number;
  /** @deprecated Use titleLayer.animation.entryEase */
  defaultEase: keyof EasingConfig;
  /** @deprecated Use titleLayer.fontFamily */
  fontFamily: string;
  /** @deprecated Use titleLayer.fontWeight */
  fontWeight: number;
  /** @deprecated Use titleLayer.letterSpacing */
  letterSpacing: number;
  /** @deprecated Use titleLayer.textTransform */
  textTransform: 'uppercase' | 'lowercase' | 'none';
  /** @deprecated Use titleLayer.animation.exitDuration */
  exitDuration: number;
  /** @deprecated Use titleLayer.animation.idleMotion */
  idleMotion: 'none' | 'scaleUp' | 'panX' | 'panY';
  /** @deprecated Use titleLayer.animation.idleSpeed */
  idleSpeed: number;
  /** @deprecated Use titleLayer.color */
  color: string;
  /** @deprecated Use titleLayer.lineHeight */
  lineHeight: number;
  /** @deprecated Use titleLayer.fontStyle */
  fontStyle: 'normal' | 'italic';
}

// ─── Global Motion Config (Root) ─────────────────────────────────────────────

export interface GlobalMotionConfig {
  version: string;
  easing: EasingConfig;
  posterizeTime: PosterizeTimeConfig;
  trail: TrailConfig;
  wiggle: WiggleConfig;
  canvas: CanvasConfig;
  typography: TypographyConfig;
}

// ─── Library / Asset Registry ────────────────────────────────────────────────

export interface LibraryCategory {
  id: string;
  label: string;
  description: string;
  basePath: string;
}

export type AssetFormat = 'mov' | 'webm' | 'mp4' | 'svg';

export interface LibraryAsset {
  id: string;
  name: string;
  category: string;
  filename: string;
  format: AssetFormat;
  /** Duration in seconds (for video assets) */
  duration?: number;
  /** Resolution string, e.g., "1920x1080" */
  resolution?: string;
  /** Whether the asset has alpha transparency */
  hasAlpha: boolean;
  /** Tags for filtering */
  tags: string[];
  /** Thumbnail path relative to public/ */
  thumbnail?: string;
}

export interface LibraryConfig {
  version: string;
  categories: LibraryCategory[];
  assets: LibraryAsset[];
}

// ─── Editor State ────────────────────────────────────────────────────────────

export type NoiseChannel = 'x' | 'y' | 'rotation' | 'scale' | 'opacity' | 'scaleX' | 'scaleY' | 'skew';

export type EditorPanel = 'typography' | 'generative' | 'library' | 'composition' | 'export';

export interface LibraryLocalItem {
  id: string;
  name: string;
  type: 'typography' | 'generative';
  createdAt: number;
  data: any; // A payload containing the layers and config
}

export interface ExportState {
  isExporting: boolean;
  progress: number;
  currentFrame: number;
  totalFrames: number;
  stage: 'idle' | 'capturing' | 'encoding' | 'complete' | 'error';
  errorMessage?: string;
  exportMode?: 'webcodecs-hw' | 'ffmpeg-fallback';
}

export interface ExportConfig {
  resolution: '1920x1080' | '1080x1080' | '1080x1920' | '1350x1080';
  fps: number;
  duration: number; // in seconds
  format: 'png-sequence' | 'mp4' | 'mov' | 'png-still';
  stillFrame: number; // Frame to export if format is png-still
  
  // Background & Composition
  backgroundColor: string;
  backgroundImageUrl?: string;
  backgroundType?: 'image' | 'video';
  aspectRatioMode: 'fit' | 'crop' | 'manual';
  overlayScale: number;
  overlayX: number;
  overlayY: number;
  bgTrimStart?: number;
  bgTrimEnd?: number;
  enableMotionBlur?: boolean;
}

// ─── Composition State ───────────────────────────────────────────────────────

export interface CompositionLayer {
  id: string;
  name: string;
  type: 'video' | 'localAsset' | 'remoteAsset' | 'cloudAsset';
  /** ID referencing the LibraryLocalItem or LibraryAsset */
  assetId: string;
  /** Start time in the composition (seconds) */
  startTime: number;
  /** Duration in the composition (seconds) */
  duration: number;
  /** Start offset for video trimming (seconds) */
  trimStart?: number;
  /** End offset for video trimming (seconds) */
  trimEnd?: number;
  /** Layer spatial transform */
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
  /** Whether the layer is hidden in the preview */
  hidden?: boolean;
  /** Whether the layer is locked from editing */
  locked?: boolean;
}
