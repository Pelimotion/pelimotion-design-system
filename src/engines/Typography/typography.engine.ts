/**
 * Typographic Engine — Timeline Factory v2
 * 
 * Professional-grade animation engine for kinetic typography.
 * Supports:
 * - 10+ animation presets (entry + exit)
 * - Per-layer timeline building with independent controls
 * - Master timeline orchestration for multi-layer compositions
 * - Custom property animation (x, y, scale, rotation, blur, opacity, skew)
 * - Advanced stagger modes (start, end, center, edges, random)
 */
import { gsap } from 'gsap'
import type {
  TypographyLayer,
  TypographyConfig,
  EntryPreset,
  ExitPreset,
  StaggerFrom,
  TypoLayerAnimation,
} from '@/types/motion.types'

// ─── Animation Property Set ─────────────────────────────────────────────────

export interface AnimProps {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  blur: number;
  opacity: number;
  skewX: number;
  skewY: number;
}

// ─── Preset Definitions ──────────────────────────────────────────────────────

const ENTRY_PRESETS: Record<EntryPreset, AnimProps> = {
  fadeUp:      { x: 0,    y: 50,   scale: 0.85, rotation: 0,    blur: 12, opacity: 0, skewX: 0,  skewY: 0 },
  fadeDown:    { x: 0,    y: -50,  scale: 0.85, rotation: 0,    blur: 12, opacity: 0, skewX: 0,  skewY: 0 },
  slideLeft:   { x: 120,  y: 0,    scale: 1,    rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  slideRight:  { x: -120, y: 0,    scale: 1,    rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  scaleIn:     { x: 0,    y: 0,    scale: 0,    rotation: 0,    blur: 8,  opacity: 0, skewX: 0,  skewY: 0 },
  rotateIn:    { x: 0,    y: 30,   scale: 0.9,  rotation: -15,  blur: 4,  opacity: 0, skewX: 0,  skewY: 0 },
  blurIn:      { x: 0,    y: 0,    scale: 1.1,  rotation: 0,    blur: 30, opacity: 0, skewX: 0,  skewY: 0 },
  typewriter:  { x: 0,    y: 0,    scale: 1,    rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  elastic:     { x: 0,    y: 80,   scale: 0.3,  rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  glitch:      { x: 20,   y: 0,    scale: 1.05, rotation: 2,    blur: 0,  opacity: 0, skewX: 15, skewY: 0 },
  custom:      { x: 0,    y: 0,    scale: 1,    rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
};

const EXIT_PRESETS: Record<ExitPreset, AnimProps> = {
  fadeUp:      { x: 0,    y: -50,  scale: 1.1,  rotation: 0,    blur: 12, opacity: 0, skewX: 0,  skewY: 0 },
  fadeDown:    { x: 0,    y: 50,   scale: 0.9,  rotation: 0,    blur: 12, opacity: 0, skewX: 0,  skewY: 0 },
  slideLeft:   { x: -120, y: 0,    scale: 1,    rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  slideRight:  { x: 120,  y: 0,    scale: 1,    rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  scaleOut:    { x: 0,    y: 0,    scale: 2,    rotation: 0,    blur: 8,  opacity: 0, skewX: 0,  skewY: 0 },
  rotateOut:   { x: 0,    y: -30,  scale: 0.9,  rotation: 15,   blur: 4,  opacity: 0, skewX: 0,  skewY: 0 },
  blurOut:     { x: 0,    y: 0,    scale: 1.1,  rotation: 0,    blur: 30, opacity: 0, skewX: 0,  skewY: 0 },
  dissolve:    { x: 0,    y: 0,    scale: 1,    rotation: 0,    blur: 16, opacity: 0, skewX: 0,  skewY: 0 },
  custom:      { x: 0,    y: 0,    scale: 1,    rotation: 0,    blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Gets the animation property values for a given preset.
 * When preset is 'custom', returns the user-defined custom values from the animation config.
 */
export function getEntryPresetValues(anim: TypoLayerAnimation): AnimProps {
  if (anim.entryPreset === 'custom') {
    return {
      x: anim.entryX,
      y: anim.entryY,
      scale: anim.entryScale,
      rotation: anim.entryRotation,
      blur: anim.entryBlur,
      opacity: anim.entryOpacity,
      skewX: anim.entrySkewX,
      skewY: anim.entrySkewY,
    };
  }
  return { ...ENTRY_PRESETS[anim.entryPreset] };
}

export function getExitPresetValues(anim: TypoLayerAnimation): AnimProps {
  if (anim.exitPreset === 'custom') {
    return {
      x: anim.exitX,
      y: anim.exitY,
      scale: anim.exitScale,
      rotation: anim.exitRotation,
      blur: anim.exitBlur,
      opacity: anim.exitOpacity,
      skewX: anim.exitSkewX,
      skewY: anim.exitSkewY,
    };
  }
  return { ...EXIT_PRESETS[anim.exitPreset] };
}

/**
 * Converts a StaggerFrom value to GSAP stagger config.
 */
function buildStaggerConfig(staggerTime: number, from: StaggerFrom): gsap.StaggerVars {
  const config: gsap.StaggerVars = { each: staggerTime };
  
  switch (from) {
    case 'start':
      config.from = 'start';
      break;
    case 'end':
      config.from = 'end';
      break;
    case 'center':
      config.from = 'center';
      break;
    case 'edges':
      config.from = 'edges';
      break;
    case 'random':
      config.from = 'random';
      break;
  }
  
  return config;
}

/**
 * Converts AnimProps to a GSAP-compatible vars object.
 */
function propsToGSAP(props: AnimProps): gsap.TweenVars {
  const vars: gsap.TweenVars = {
    x: props.x,
    y: props.y,
    scale: props.scale,
    rotation: props.rotation,
    autoAlpha: props.opacity,
    skewX: props.skewX,
    skewY: props.skewY,
  };
  if (props.blur > 0) {
    vars.filter = `blur(${props.blur}px)`;
  }
  return vars;
}

// ─── Entry Timeline Builder ──────────────────────────────────────────────────

/**
 * Creates an entry animation timeline for split text targets.
 * Sets targets to their starting state, then animates to pristine.
 */
export function createEntryTimeline(
  targets: gsap.DOMTarget,
  anim: TypoLayerAnimation
): gsap.core.Timeline {
  const tl = gsap.timeline();
  const props = getEntryPresetValues(anim);
  const startVars = propsToGSAP(props);
  
  // Set starting state
  gsap.set(targets, {
    ...startVars,
    visibility: 'visible',
  });

  // Build end state (pristine)
  const endVars: gsap.TweenVars = {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    filter: 'blur(0px)',
    duration: anim.entryDuration,
    ease: anim.entryEase,
    stagger: anim.splitMode !== 'none' 
      ? buildStaggerConfig(anim.entryStagger, anim.staggerFrom)
      : 0,
    clearProps: 'filter',
  };

  // Typewriter: override to force opacity-only with custom stagger
  if (anim.entryPreset === 'typewriter') {
    gsap.set(targets, { autoAlpha: 0 });
    endVars.autoAlpha = 1;
    endVars.duration = 0.05;
    endVars.ease = 'none';
    delete endVars.x;
    delete endVars.y;
    delete endVars.scale;
    delete endVars.rotation;
    delete endVars.skewX;
    delete endVars.skewY;
    delete endVars.filter;
  }

  // Elastic: use a bouncy ease
  if (anim.entryPreset === 'elastic') {
    endVars.ease = 'elastic.out(1, 0.5)';
  }

  tl.to(targets, endVars);
  return tl;
}

// ─── Exit Timeline Builder ───────────────────────────────────────────────────

export function createExitTimeline(
  targets: gsap.DOMTarget,
  anim: TypoLayerAnimation
): gsap.core.Timeline {
  const tl = gsap.timeline();
  const props = getExitPresetValues(anim);
  const endVars: gsap.TweenVars = {
    ...propsToGSAP(props),
    duration: anim.exitDuration,
    ease: anim.exitEase,
    stagger: anim.splitMode !== 'none'
      ? buildStaggerConfig(anim.exitStagger, anim.staggerFrom)
      : 0,
  };

  if (props.blur > 0) {
    endVars.filter = `blur(${props.blur}px)`;
  } else {
    endVars.filter = 'blur(0px)';
  }

  tl.to(targets, endVars);
  return tl;
}

// ─── Idle Motion Timeline ────────────────────────────────────────────────────

export function createIdleTimeline(
  target: gsap.DOMTarget,
  anim: TypoLayerAnimation,
  holdDuration: number
): gsap.core.Timeline {
  const tl = gsap.timeline();
  const { idleMotion, idleSpeed, idleIntensity } = anim;

  if (idleMotion === 'none') return tl;

  const intensity = idleIntensity || 1;

  switch (idleMotion) {
    case 'scaleUp':
      tl.fromTo(target, { scale: 1 }, {
        scale: 1 + 0.05 * idleSpeed * intensity,
        duration: holdDuration,
        ease: 'none',
      });
      break;
    case 'panX':
      tl.fromTo(target, { x: 0 }, {
        x: 50 * idleSpeed * intensity,
        duration: holdDuration,
        ease: 'none',
      });
      break;
    case 'panY':
      tl.fromTo(target, { y: 0 }, {
        y: -50 * idleSpeed * intensity,
        duration: holdDuration,
        ease: 'none',
      });
      break;
    case 'float':
      tl.to(target, {
        y: -15 * intensity,
        duration: holdDuration * 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: Math.floor(holdDuration / (holdDuration * 0.5)),
      });
      break;
    case 'breathe':
      tl.to(target, {
        scale: 1 + 0.03 * intensity,
        duration: holdDuration * 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: Math.floor(holdDuration / (holdDuration * 0.5)),
      });
      break;
    case 'wiggle':
      tl.to(target, {
        x: 5 * intensity,
        rotation: 1 * intensity,
        duration: 0.15,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: Math.floor(holdDuration / 0.3),
      });
      break;
  }

  return tl;
}

// ─── Per-Layer Full Timeline ─────────────────────────────────────────────────

export interface LayerTimelineOptions {
  /** Targets for SplitText animation (chars/words/lines) */
  splitTargets: gsap.DOMTarget;
  /** The wrapper element for idle motion */
  wrapperTarget: gsap.DOMTarget;
  /** Layer configuration */
  layer: TypographyLayer;
  /** Global hold time */
  timeOnScreen: number;
}

/**
 * Creates a complete timeline for a single typography layer:
 * [delay] → [entry] → [idle hold] → [exit]
 */
export function createLayerTimeline(opts: LayerTimelineOptions): gsap.core.Timeline {
  const { splitTargets, wrapperTarget, layer, timeOnScreen } = opts;
  const { animation } = layer;
  const tl = gsap.timeline();

  // Entry
  const entryTl = createEntryTimeline(splitTargets, animation);
  tl.add(entryTl, animation.entryDelay);

  // Idle (runs across entry + hold)
  const entryEnd = animation.entryDelay + entryTl.duration();
  const idleTl = createIdleTimeline(wrapperTarget, animation, entryTl.duration() + timeOnScreen);
  tl.add(idleTl, animation.entryDelay);

  // Exit
  const exitStart = entryEnd + timeOnScreen + animation.exitDelay;
  const exitTl = createExitTimeline(splitTargets, animation);
  tl.add(exitTl, exitStart);

  return tl;
}

// ─── Master Timeline Orchestrator ────────────────────────────────────────────

export interface MasterTimelineOptions {
  /** Title split targets */
  titleSplitTargets?: gsap.DOMTarget;
  /** Title wrapper for idle */
  titleWrapper?: gsap.DOMTarget;
  /** Subtitle split targets */
  subtitleSplitTargets?: gsap.DOMTarget;
  /** Subtitle wrapper for idle */
  subtitleWrapper?: gsap.DOMTarget;
  /** Full typography config */
  config: TypographyConfig;
}

/**
 * Composes the master typography timeline from individual layer timelines.
 * Respects layer enabling, link animation, and global timing.
 */
export function createMasterTimeline(opts: MasterTimelineOptions): gsap.core.Timeline {
  const {
    titleSplitTargets, titleWrapper,
    subtitleSplitTargets, subtitleWrapper,
    config,
  } = opts;

  const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
  const { titleLayer, subtitleLayer, timeOnScreen, linkAnimation } = config;

  // Title timeline
  if (titleLayer.enabled && titleSplitTargets && titleWrapper) {
    const titleTl = createLayerTimeline({
      splitTargets: titleSplitTargets,
      wrapperTarget: titleWrapper,
      layer: titleLayer,
      timeOnScreen,
    });
    masterTl.add(titleTl, 0);
  }

  // Subtitle timeline
  if (subtitleLayer.enabled && subtitleSplitTargets && subtitleWrapper) {
    const subAnim = linkAnimation
      ? { ...subtitleLayer, animation: { ...titleLayer.animation, entryDelay: subtitleLayer.animation.entryDelay } }
      : subtitleLayer;

    const subtitleTl = createLayerTimeline({
      splitTargets: subtitleSplitTargets,
      wrapperTarget: subtitleWrapper,
      layer: subAnim,
      timeOnScreen,
    });
    masterTl.add(subtitleTl, 0);
  }

  return masterTl;
}

// ─── Legacy Compat Export ────────────────────────────────────────────────────

export interface TypographyAnimOptions {
  duration?: number;
  stagger?: number;
  ease?: string;
  xOffset?: number;
  yOffset?: number;
  scale?: number;
  blur?: number;
  opacityStart?: number;
  isExit?: boolean;
}

/**
 * @deprecated Use createEntryTimeline / createExitTimeline instead.
 * Kept for backward compatibility with Trail engine.
 */
export function createTypographyTimeline(
  targets: gsap.DOMTarget,
  options: TypographyAnimOptions = {}
): gsap.core.Timeline {
  const {
    duration = 0.8,
    stagger = 0.03,
    ease = 'entrySmooth',
    xOffset = 0,
    yOffset = 30,
    scale = 0.95,
    blur = 8,
    opacityStart = 0,
    isExit = false,
  } = options;

  const tl = gsap.timeline();

  if (isExit) {
    tl.to(targets, {
      opacity: opacityStart,
      x: xOffset,
      y: yOffset,
      scale: scale,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
      duration,
      stagger,
      ease,
    });
  } else {
    gsap.set(targets, {
      opacity: opacityStart,
      x: xOffset,
      y: yOffset,
      scale: scale,
      filter: blur > 0 ? `blur(${blur}px)` : 'none',
    });

    tl.to(targets, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration,
      stagger,
      ease,
      clearProps: 'filter',
    });
  }

  return tl;
}
