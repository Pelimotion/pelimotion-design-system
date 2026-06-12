/**
 * Typographic Engine — Timeline Factory v3
 *
 * Professional-grade animation engine for kinetic typography.
 * All presets are properly implemented with dedicated animation logic.
 * Blur is applied via GSAP filter to avoid WebKit issues.
 */
import { gsap } from 'gsap';
import type {
  TypographyLayer,
  EntryPreset,
  ExitPreset,
  StaggerFrom,
  TypoLayerAnimation,
} from '@/types/motion.types';

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
  rotateX?: number;
  clipPath?: string;
}

// ─── Preset Definitions ──────────────────────────────────────────────────────

const ENTRY_PRESETS: Record<EntryPreset, AnimProps> = {
  fadeUp:     { x: 0,    y: 50,   scale: 0.88, rotation: 0,   blur: 10, opacity: 0, skewX: 0,  skewY: 0 },
  fadeDown:   { x: 0,    y: -50,  scale: 0.88, rotation: 0,   blur: 10, opacity: 0, skewX: 0,  skewY: 0 },
  slideLeft:  { x: 120,  y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  slideRight: { x: -120, y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  scaleIn:    { x: 0,    y: 0,    scale: 0,    rotation: 0,   blur: 6,  opacity: 0, skewX: 0,  skewY: 0 },
  rotateIn:   { x: 0,    y: 30,   scale: 0.9,  rotation: -15, blur: 4,  opacity: 0, skewX: 0,  skewY: 0 },
  blurIn:     { x: 0,    y: 0,    scale: 1.1,  rotation: 0,   blur: 32, opacity: 0, skewX: 0,  skewY: 0 },
  typewriter: { x: 0,    y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  elastic:    { x: 0,    y: 80,   scale: 0.3,  rotation: 0,   blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
  glitch:     { x: 20,   y: 0,    scale: 1.05, rotation: 2,   blur: 0,  opacity: 0, skewX: 15, skewY: 0 },
  reveal:     { x: 0,    y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 1, skewX: 0,  skewY: 0, clipPath: 'inset(110% 0% 0% 0%)' },
  splitFlip:  { x: 0,    y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0,  skewY: 0, rotateX: -90 },
  custom:     { x: 0,    y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0,  skewY: 0 },
};

const EXIT_PRESETS: Record<ExitPreset, AnimProps> = {
  fadeUp:    { x: 0,    y: -50,  scale: 1.1,  rotation: 0,   blur: 10, opacity: 0, skewX: 0, skewY: 0 },
  fadeDown:  { x: 0,    y: 50,   scale: 0.9,  rotation: 0,   blur: 10, opacity: 0, skewX: 0, skewY: 0 },
  slideLeft: { x: -120, y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0, skewY: 0 },
  slideRight:{ x: 120,  y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0, skewY: 0 },
  scaleOut:  { x: 0,    y: 0,    scale: 2,    rotation: 0,   blur: 8,  opacity: 0, skewX: 0, skewY: 0 },
  rotateOut: { x: 0,    y: -30,  scale: 0.9,  rotation: 15,  blur: 4,  opacity: 0, skewX: 0, skewY: 0 },
  blurOut:   { x: 0,    y: 0,    scale: 1.1,  rotation: 0,   blur: 32, opacity: 0, skewX: 0, skewY: 0 },
  dissolve:  { x: 0,    y: 0,    scale: 1,    rotation: 0,   blur: 16, opacity: 0, skewX: 0, skewY: 0 },
  reveal:    { x: 0,    y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 1, skewX: 0, skewY: 0, clipPath: 'inset(0% 0% 110% 0%)' },
  custom:    { x: 0,    y: 0,    scale: 1,    rotation: 0,   blur: 0,  opacity: 0, skewX: 0, skewY: 0 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getEntryPresetValues(anim: TypoLayerAnimation): AnimProps {
  if (anim.entryPreset === 'custom') {
    return {
      x: anim.entryX, y: anim.entryY,
      scale: anim.entryScale, rotation: anim.entryRotation,
      blur: anim.entryBlur, opacity: anim.entryOpacity,
      skewX: anim.entrySkewX, skewY: anim.entrySkewY,
    };
  }
  return { ...ENTRY_PRESETS[anim.entryPreset] };
}

export function getExitPresetValues(anim: TypoLayerAnimation): AnimProps {
  if (anim.exitPreset === 'custom') {
    return {
      x: anim.exitX, y: anim.exitY,
      scale: anim.exitScale, rotation: anim.exitRotation,
      blur: anim.exitBlur, opacity: anim.exitOpacity,
      skewX: anim.exitSkewX, skewY: anim.exitSkewY,
    };
  }
  return { ...EXIT_PRESETS[anim.exitPreset] };
}

function buildStaggerConfig(staggerTime: number, from: StaggerFrom): gsap.StaggerVars {
  const config: gsap.StaggerVars = { each: staggerTime };
  config.from = from as any;
  return config;
}

// ─── Entry Timeline Builder ──────────────────────────────────────────────────

export function createEntryTimeline(
  targets: gsap.DOMTarget,
  anim: TypoLayerAnimation
): gsap.core.Timeline {
  const tl = gsap.timeline();
  const props = getEntryPresetValues(anim);
  const stagger = anim.splitMode !== 'none'
    ? buildStaggerConfig(anim.entryStagger, anim.staggerFrom) : 0;

  // ── Typewriter: purely sequential opacity reveal ──────────────────────────
  if (anim.entryPreset === 'typewriter') {
    gsap.set(targets, { autoAlpha: 0 });
    tl.to(targets, {
      autoAlpha: 1, duration: 0.04, ease: 'none',
      stagger: buildStaggerConfig(anim.entryStagger || 0.06, anim.staggerFrom),
    });
    return tl;
  }

  // ── Reveal: clip-path wipe ────────────────────────────────────────────────
  if (anim.entryPreset === 'reveal') {
    // Each target needs overflow hidden on its wrapper
    gsap.set(targets, {
      clipPath: 'inset(110% 0% 0% 0%)',
      transformOrigin: 'center bottom',
    });
    tl.to(targets, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: anim.entryDuration,
      ease: anim.entryEase,
      stagger,
    });
    return tl;
  }

  // ── SplitFlip: 3D Y-axis rotation per character ───────────────────────────
  if (anim.entryPreset === 'splitFlip') {
    gsap.set(targets, {
      rotationX: -90, autoAlpha: 0,
      transformOrigin: 'center 50%',
      transformPerspective: 800,
    });
    tl.to(targets, {
      rotationX: 0, autoAlpha: 1,
      duration: anim.entryDuration,
      ease: 'back.out(1.5)',
      stagger,
    });
    return tl;
  }

  // ── Glitch: multi-step digital glitch ────────────────────────────────────
  if (anim.entryPreset === 'glitch') {
    gsap.set(targets, { autoAlpha: 0 });
    tl
      .to(targets, { autoAlpha: 1, x: -12, skewX: -8, duration: 0.04, ease: 'none', stagger })
      .to(targets, { x: 10, skewX: 6, filter: 'blur(2px)', duration: 0.04, ease: 'none' })
      .to(targets, { x: -6, skewX: -3, filter: 'blur(0px)', duration: 0.03, ease: 'none' })
      .to(targets, { x: 0, skewX: 0, duration: anim.entryDuration * 0.7, ease: 'power3.out' });
    return tl;
  }

  // ── Elastic: bouncy spring entry ─────────────────────────────────────────
  if (anim.entryPreset === 'elastic') {
    gsap.set(targets, {
      autoAlpha: 0, y: props.y, scale: props.scale,
    });
    tl.to(targets, {
      autoAlpha: 1, y: 0, scale: 1,
      duration: anim.entryDuration,
      ease: 'elastic.out(1, 0.5)',
      stagger,
    });
    return tl;
  }

  // ── Standard presets: fromTo with blur as filter ─────────────────────────
  const fromVars: gsap.TweenVars = {
    autoAlpha: props.opacity,
    x: props.x, y: props.y,
    scale: props.scale, rotation: props.rotation,
    skewX: props.skewX, skewY: props.skewY,
  };
  if (props.blur > 0) fromVars.filter = `blur(${props.blur}px)`;

  const toVars: gsap.TweenVars = {
    autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, skewY: 0,
    filter: 'blur(0px)',
    duration: anim.entryDuration,
    ease: anim.entryEase,
    stagger,
    clearProps: 'filter',
  };

  gsap.set(targets, fromVars);
  tl.to(targets, toVars);
  return tl;
}

// ─── Exit Timeline Builder ───────────────────────────────────────────────────

export function createExitTimeline(
  targets: gsap.DOMTarget,
  anim: TypoLayerAnimation
): gsap.core.Timeline {
  const tl = gsap.timeline();
  const props = getExitPresetValues(anim);
  const stagger = anim.splitMode !== 'none'
    ? buildStaggerConfig(anim.exitStagger, anim.staggerFrom) : 0;

  if (anim.exitPreset === 'reveal') {
    tl.to(targets, {
      clipPath: 'inset(0% 0% 110% 0%)',
      duration: anim.exitDuration,
      ease: anim.exitEase,
      stagger,
    });
    return tl;
  }

  const toVars: gsap.TweenVars = {
    autoAlpha: props.opacity,
    x: props.x, y: props.y,
    scale: props.scale, rotation: props.rotation,
    skewX: props.skewX, skewY: props.skewY,
    duration: anim.exitDuration,
    ease: anim.exitEase,
    stagger,
  };
  if (props.blur > 0) toVars.filter = `blur(${props.blur}px)`;

  tl.to(targets, toVars);
  return tl;
}

// ─── Idle Motion Timeline ────────────────────────────────────────────────────

export function createIdleTimeline(
  target: gsap.DOMTarget,
  anim: { idleMotion: any; idleSpeed: number; idleIntensity: number },
  holdDuration: number
): gsap.core.Timeline {
  const tl = gsap.timeline();
  const { idleMotion, idleSpeed, idleIntensity } = anim;
  if (idleMotion === 'none') return tl;
  const intensity = idleIntensity || 1;

  switch (idleMotion) {
    case 'scaleUp':
      tl.fromTo(target,
        { scale: 1 },
        { scale: 1 + 0.04 * idleSpeed * intensity, duration: holdDuration, ease: 'none' }
      );
      break;
    case 'panX':
      tl.fromTo(target,
        { x: 0 },
        { x: 40 * idleSpeed * intensity, duration: holdDuration, ease: 'none' }
      );
      break;
    case 'panY':
      tl.fromTo(target,
        { y: 0 },
        { y: -40 * idleSpeed * intensity, duration: holdDuration, ease: 'none' }
      );
      break;
    case 'float':
      tl.to(target, {
        y: -12 * intensity, duration: holdDuration * 0.5,
        ease: 'sine.inOut', yoyo: true,
        repeat: Math.max(1, Math.floor(holdDuration / (holdDuration * 0.5))),
      });
      break;
    case 'breathe':
      tl.to(target, {
        scale: 1 + 0.025 * intensity, duration: holdDuration * 0.5,
        ease: 'sine.inOut', yoyo: true,
        repeat: Math.max(1, Math.floor(holdDuration / (holdDuration * 0.5))),
      });
      break;
    case 'wiggle':
      tl.to(target, {
        x: 4 * intensity, rotation: 0.8 * intensity, duration: 0.12,
        ease: 'sine.inOut', yoyo: true,
        repeat: Math.max(1, Math.floor(holdDuration / 0.25)),
      });
      break;
  }
  return tl;
}

// ─── Per-Layer Full Timeline ─────────────────────────────────────────────────

export interface LayerTimelineOptions {
  splitTargets: gsap.DOMTarget;
  wrapperTarget: gsap.DOMTarget;
  layer: TypographyLayer;
  timeOnScreen: number;
}

export function createLayerTimeline(opts: LayerTimelineOptions): gsap.core.Timeline {
  const { splitTargets, wrapperTarget, layer, timeOnScreen } = opts;
  const { animation } = layer;
  const tl = gsap.timeline();

  const entryTl = createEntryTimeline(splitTargets, animation);
  tl.add(entryTl, animation.entryDelay);

  const entryEnd = animation.entryDelay + entryTl.duration();
  const idleTl = createIdleTimeline(wrapperTarget, animation, entryTl.duration() + timeOnScreen);
  tl.add(idleTl, animation.entryDelay);

  const exitStart = entryEnd + timeOnScreen + animation.exitDelay;
  const exitTl = createExitTimeline(splitTargets, animation);
  tl.add(exitTl, exitStart);

  return tl;
}

// ─── Master Timeline (Dynamic Layers) ────────────────────────────────────────

export interface MasterTimelineOptions {
  layers: Array<{
    layer: TypographyLayer;
    splitTargets: gsap.DOMTarget;
    wrapperTarget: gsap.DOMTarget;
  }>;
  timeOnScreen: number;
}

export function createMasterTimeline(opts: MasterTimelineOptions): gsap.core.Timeline {
  const { layers, timeOnScreen } = opts;
  const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });

  layers.forEach(({ layer, splitTargets, wrapperTarget }) => {
    if (!layer.enabled) return;
    const layerTl = createLayerTimeline({ splitTargets, wrapperTarget, layer, timeOnScreen });
    masterTl.add(layerTl, 0);
  });

  return masterTl;
}

// ─── Legacy compat ───────────────────────────────────────────────────────────
/** @deprecated Use createEntryTimeline / createExitTimeline */
export function createTypographyTimeline(
  targets: gsap.DOMTarget,
  options: {
    duration?: number; stagger?: number; ease?: string;
    xOffset?: number; yOffset?: number; scale?: number;
    blur?: number; opacityStart?: number; isExit?: boolean;
  } = {}
): gsap.core.Timeline {
  const { duration = 0.8, stagger = 0.03, ease = 'entrySmooth', xOffset = 0, yOffset = 30,
    scale = 0.95, blur = 8, opacityStart = 0, isExit = false } = options;
  const tl = gsap.timeline();
  if (isExit) {
    tl.to(targets, { opacity: opacityStart, x: xOffset, y: yOffset, scale, filter: blur > 0 ? `blur(${blur}px)` : 'none', duration, stagger, ease });
  } else {
    gsap.set(targets, { opacity: opacityStart, x: xOffset, y: yOffset, scale, filter: blur > 0 ? `blur(${blur}px)` : 'none' });
    tl.to(targets, { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)', duration, stagger, ease, clearProps: 'filter' });
  }
  return tl;
}
