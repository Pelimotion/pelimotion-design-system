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

export type GenerativeShapeType = 'raw' | 'circle' | 'square' | 'star' | 'grid' | 'wave' | 'spirograph' | 'orbital' | 'hexagon';

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

// ─── Typography Configuration ────────────────────────────────────────────────

export interface TypographyConfig {
  /** SplitText split mode: chars, words, lines */
  splitMode: string;
  /** Default stagger between split elements (seconds) */
  defaultStagger: number;
  /** Default animation duration (seconds) */
  defaultDuration: number;
  /** Reference to an EasingConfig key name */
  defaultEase: keyof EasingConfig;
  /** Font Family */
  fontFamily: string;
  /** Font Weight */
  fontWeight: number;
  /** Letter spacing in em */
  letterSpacing: number;
  /** Text transformation */
  textTransform: 'uppercase' | 'lowercase' | 'none';
  /** How long the text stays on screen after entry before exiting (seconds) */
  timeOnScreen: number;
  /** Exit animation duration (seconds) */
  exitDuration: number;
  /** Continuous motion style during idle time */
  idleMotion: 'none' | 'scaleUp' | 'panX' | 'panY';
  /** Speed scalar for idle motion */
  idleSpeed: number;
  /** Text Color (Hex/RGB/CSS name) */
  color: string;
  /** CSS Line Height multiplier */
  lineHeight: number;
  /** Italic or normal */
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

export type EditorPanel = 'typography' | 'generative' | 'library' | 'export';

export interface ExportState {
  isExporting: boolean;
  progress: number;
  currentFrame: number;
  totalFrames: number;
  stage: 'idle' | 'capturing' | 'encoding' | 'complete' | 'error';
  errorMessage?: string;
}

export interface ExportConfig {
  resolution: '1920x1080' | '1080x1080' | '1080x1920' | '1350x1080';
  fps: number;
  duration: number; // in seconds
  format: 'png-sequence' | 'mp4' | 'mov' | 'png-still';
  stillFrame: number; // Frame to export if format is png-still
  
  // Background & Composition
  backgroundImageUrl?: string;
  backgroundType?: 'image' | 'video';
  aspectRatioMode: 'fit' | 'crop' | 'manual';
  overlayScale: number;
  overlayX: number;
  overlayY: number;
}
