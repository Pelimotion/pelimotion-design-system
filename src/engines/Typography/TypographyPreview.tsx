/**
 * TypographyPreview — Interactive Canvas v2
 *
 * Professional-grade kinetic typography preview with:
 * - Dual layer rendering (Title + Subtitle)
 * - 6 layout modes with automatic positioning
 * - GSAP Draggable for direct mouse manipulation (drag/rotate/scale)
 * - Selection gizmo with visual handles (Figma-style)
 * - Master timeline animation (entry → idle → exit loop)
 * - Trail/echo compatibility via legacy engine
 */
import { useRef, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { Draggable } from 'gsap/Draggable'
import { useGSAP } from '@gsap/react'
import { useEditorStore } from '@/store/useEditorStore'
import { createMasterTimeline, createTypographyTimeline } from './typography.engine'
import type { TypographyLayer, TypographyLayoutMode, TypoLayerTransform } from '@/types/motion.types'

gsap.registerPlugin(useGSAP, Draggable)

// ─── Layout Positioning ──────────────────────────────────────────────────────

interface LayoutPosition {
  titleStyle: React.CSSProperties;
  subtitleStyle: React.CSSProperties;
}

function computeLayout(
  mode: TypographyLayoutMode,
  gap: number,
  titleTransform: TypoLayerTransform,
  subtitleTransform: TypoLayerTransform,
): LayoutPosition {
  const base: React.CSSProperties = {
    position: 'relative',
    transformOrigin: 'center center',
    willChange: 'transform',
  };

  const applyTransform = (t: TypoLayerTransform): React.CSSProperties => ({
    transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale}) rotate(${t.rotation}deg)`,
    opacity: t.opacity,
  });

  switch (mode) {
    case 'center':
      return {
        titleStyle: { ...base, textAlign: 'center', ...applyTransform(titleTransform) },
        subtitleStyle: { ...base, textAlign: 'center', marginTop: gap, ...applyTransform(subtitleTransform) },
      };
    case 'stack':
      return {
        titleStyle: { ...base, textAlign: 'center', ...applyTransform(titleTransform) },
        subtitleStyle: { ...base, textAlign: 'center', marginTop: gap, ...applyTransform(subtitleTransform) },
      };
    case 'sideBySide':
      return {
        titleStyle: { ...base, ...applyTransform(titleTransform) },
        subtitleStyle: { ...base, marginLeft: gap, ...applyTransform(subtitleTransform) },
      };
    case 'diagonal':
      return {
        titleStyle: {
          ...base,
          ...applyTransform({
            ...titleTransform,
            x: titleTransform.x - 60,
            y: titleTransform.y - 30,
          }),
        },
        subtitleStyle: {
          ...base,
          ...applyTransform({
            ...subtitleTransform,
            x: subtitleTransform.x + 60,
            y: subtitleTransform.y + 30,
          }),
        },
      };
    case 'overlap':
      return {
        titleStyle: { ...base, ...applyTransform(titleTransform), zIndex: 2 },
        subtitleStyle: {
          ...base,
          position: 'absolute',
          ...applyTransform({
            ...subtitleTransform,
            x: subtitleTransform.x + 20,
            y: subtitleTransform.y + 20,
          }),
          zIndex: 1,
        },
      };
    case 'freeform':
      return {
        titleStyle: {
          ...base,
          position: 'absolute',
          ...applyTransform(titleTransform),
        },
        subtitleStyle: {
          ...base,
          position: 'absolute',
          ...applyTransform(subtitleTransform),
        },
      };
    default:
      return {
        titleStyle: { ...base, ...applyTransform(titleTransform) },
        subtitleStyle: { ...base, marginTop: gap, ...applyTransform(subtitleTransform) },
      };
  }
}

// ─── SVG Stroke Filter for Trail ─────────────────────────────────────────────

function colorToId(hex: string) {
  return hex.replace(/[^a-zA-Z0-9]/g, '')
}

// ─── Selection Gizmo ─────────────────────────────────────────────────────────

function SelectionGizmo({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: -8,
        border: '1.5px dashed var(--color-accent)',
        borderRadius: 4,
        pointerEvents: 'none',
        zIndex: 100,
        boxShadow: '0 0 12px hsla(191, 100%, 50%, 0.15)',
      }}
    >
      {/* Corner handles */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => {
        const [v, h] = corner.split('-');
        return (
          <div
            key={corner}
            className={`scale-handle scale-handle-${corner}`}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--color-accent)',
              border: '1px solid rgba(0,0,0,0.3)',
              [v as any]: -4,
              [h as any]: -4,
              cursor: `${corner.replace('-', '')}-resize` as any,
              pointerEvents: 'auto',
              boxShadow: '0 0 6px hsla(191, 100%, 50%, 0.3)',
            }}
          />
        );
      })}
      {/* Rotation handle */}
      <div
        className="rotate-handle"
        style={{
          position: 'absolute',
          top: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          border: '2px solid rgba(0,0,0,0.2)',
          cursor: 'grab',
          pointerEvents: 'auto',
          boxShadow: '0 0 8px hsla(191, 100%, 50%, 0.4)',
        }}
      />
      {/* Line from rotation handle */}
      <div
        style={{
          position: 'absolute',
          top: -16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1,
          height: 16,
          background: 'var(--color-accent)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── Typography Layer Renderer ───────────────────────────────────────────────

interface LayerRendererProps {
  layer: TypographyLayer;
  innerRef: React.RefObject<HTMLDivElement | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  onSelect: () => void;
  layoutStyle: React.CSSProperties;
  isDraggable: boolean;
}

function LayerRenderer({ layer, innerRef, wrapperRef, isSelected, onSelect, layoutStyle, isDraggable }: LayerRendererProps) {
  if (!layer.enabled) return null;

  return (
    <div
      ref={wrapperRef}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{
        ...layoutStyle,
        cursor: isDraggable ? 'grab' : 'pointer',
        userSelect: 'none',
        maxWidth: `${layer.maxWidth}%`,
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <SelectionGizmo active={isSelected} />
        <div
          ref={innerRef}
          style={{
            color: layer.color,
            fontFamily: `'${layer.fontFamily}', sans-serif`,
            fontWeight: layer.fontWeight,
            fontSize: `${layer.fontSize}rem`,
            letterSpacing: `${layer.letterSpacing}em`,
            lineHeight: layer.lineHeight,
            fontStyle: layer.fontStyle,
            textTransform: layer.textTransform as any,
            textAlign: layer.textAlign as any,
            whiteSpace: 'pre-wrap',
            transformOrigin: 'center center',
          }}
        >
          {layer.text}
        </div>
      </div>
    </div>
  );
}

// ─── Main Preview Component ──────────────────────────────────────────────────

export function TypographyPreview() {
  const {
    motionConfig, activeTypoLayerId,
    setActiveTypoLayer,
    updateTitleTransform, updateSubtitleTransform,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLDivElement>(null);
  const titleWrapperRef = useRef<HTMLDivElement>(null);
  const subtitleTextRef = useRef<HTMLDivElement>(null);
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);
  const cloneRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track animation state for future interactive pause
  const _animatingRef = useRef(true);

  const typoConfig = motionConfig.typography;
  const { titleLayer, subtitleLayer, layoutMode, layoutGap, timeOnScreen } = typoConfig;
  const trailConfig = motionConfig.trail;

  const MAX_TRAIL_INSTANCES = 12;
  const activeTrailInstances = trailConfig.enabled ? Math.min(trailConfig.instances, MAX_TRAIL_INSTANCES) : 0;

  const strokeFilterId = `pelimotion-outer-stroke-${colorToId(trailConfig.trailColor || '#ffffff')}`;

  // Layout computation
  const layout = computeLayout(layoutMode, layoutGap, titleLayer.transform, subtitleLayer.transform);

  // Determine flex direction based on layout mode
  const isHorizontal = layoutMode === 'sideBySide';
  const isFreeform = layoutMode === 'freeform' || layoutMode === 'overlap';

  // Remount key for animation rebuild
  const remountKey = [
    titleLayer.text, titleLayer.enabled, titleLayer.fontFamily, titleLayer.fontWeight,
    titleLayer.fontSize, titleLayer.letterSpacing, titleLayer.lineHeight, titleLayer.fontStyle,
    titleLayer.textTransform, titleLayer.color, titleLayer.textAlign,
    titleLayer.animation.splitMode, titleLayer.animation.entryPreset, titleLayer.animation.exitPreset,
    titleLayer.animation.entryDuration, titleLayer.animation.entryStagger, titleLayer.animation.entryEase,
    titleLayer.animation.entryDelay, titleLayer.animation.staggerFrom,
    titleLayer.animation.exitDuration, titleLayer.animation.exitStagger, titleLayer.animation.exitEase,
    titleLayer.animation.exitDelay,
    titleLayer.animation.entryX, titleLayer.animation.entryY, titleLayer.animation.entryScale,
    titleLayer.animation.entryRotation, titleLayer.animation.entryBlur, titleLayer.animation.entryOpacity,
    titleLayer.animation.entrySkewX, titleLayer.animation.entrySkewY,
    titleLayer.animation.exitX, titleLayer.animation.exitY, titleLayer.animation.exitScale,
    titleLayer.animation.exitRotation, titleLayer.animation.exitBlur, titleLayer.animation.exitOpacity,
    titleLayer.animation.exitSkewX, titleLayer.animation.exitSkewY,
    titleLayer.animation.idleMotion, titleLayer.animation.idleSpeed, titleLayer.animation.idleIntensity,
    subtitleLayer.text, subtitleLayer.enabled, subtitleLayer.fontFamily, subtitleLayer.fontWeight,
    subtitleLayer.fontSize, subtitleLayer.letterSpacing, subtitleLayer.lineHeight, subtitleLayer.fontStyle,
    subtitleLayer.textTransform, subtitleLayer.color, subtitleLayer.textAlign,
    subtitleLayer.animation.splitMode, subtitleLayer.animation.entryPreset, subtitleLayer.animation.exitPreset,
    subtitleLayer.animation.entryDuration, subtitleLayer.animation.entryStagger, subtitleLayer.animation.entryEase,
    subtitleLayer.animation.entryDelay, subtitleLayer.animation.staggerFrom,
    subtitleLayer.animation.exitDuration, subtitleLayer.animation.exitStagger, subtitleLayer.animation.exitEase,
    subtitleLayer.animation.exitDelay,
    subtitleLayer.animation.entryX, subtitleLayer.animation.entryY, subtitleLayer.animation.entryScale,
    subtitleLayer.animation.entryRotation, subtitleLayer.animation.entryBlur, subtitleLayer.animation.entryOpacity,
    subtitleLayer.animation.entrySkewX, subtitleLayer.animation.entrySkewY,
    subtitleLayer.animation.exitX, subtitleLayer.animation.exitY, subtitleLayer.animation.exitScale,
    subtitleLayer.animation.exitRotation, subtitleLayer.animation.exitBlur, subtitleLayer.animation.exitOpacity,
    subtitleLayer.animation.exitSkewX, subtitleLayer.animation.exitSkewY,
    subtitleLayer.animation.idleMotion, subtitleLayer.animation.idleSpeed, subtitleLayer.animation.idleIntensity,
    typoConfig.linkAnimation, timeOnScreen,
    layoutMode, layoutGap,
    trailConfig.enabled, trailConfig.style, trailConfig.trailColor, trailConfig.trailMode,
    trailConfig.instances, trailConfig.staggerDelay, trailConfig.mainEntryDelay,
    trailConfig.opacityDecay, trailConfig.scaleDecay, trailConfig.blurIncrement,
    trailConfig.trailLetterSpacing, trailConfig.trailOffsetX, trailConfig.trailOffsetY,
    trailConfig.trailScaleMultiplier, trailConfig.trailRotation, trailConfig.blendMode,
  ].join('|');

  // ─── GSAP Animation ────────────────────────────────────────────────────

  useGSAP(() => {
    const titleEl = titleTextRef.current;
    const subtitleEl = subtitleTextRef.current;
    if (!titleEl && !subtitleEl) return;

    // Split text elements
    let titleSplit: any = null;
    let subtitleSplit: any = null;
    let titleTargets: any = null;
    let subtitleTargets: any = null;

    const getSplitType = (mode: string) => {
      if (mode === 'none') return 'chars'; // fallback, we won't use split targets
      return mode;
    };

    if (titleEl && titleLayer.enabled) {
      titleSplit = new SplitText(titleEl, {
        type: getSplitType(titleLayer.animation.splitMode),
        charsClass: 'pelimotion-char inline-block',
        wordsClass: 'pelimotion-word inline-block',
        linesClass: 'pelimotion-line inline-block',
      });
      const targetKey = titleLayer.animation.splitMode === 'none' ? 'chars' : titleLayer.animation.splitMode;
      titleTargets = titleLayer.animation.splitMode === 'none' ? [titleEl] : titleSplit[targetKey];
    }

    if (subtitleEl && subtitleLayer.enabled) {
      subtitleSplit = new SplitText(subtitleEl, {
        type: getSplitType(subtitleLayer.animation.splitMode),
        charsClass: 'pelimotion-char-sub inline-block',
        wordsClass: 'pelimotion-word-sub inline-block',
        linesClass: 'pelimotion-line-sub inline-block',
      });
      const targetKey = subtitleLayer.animation.splitMode === 'none' ? 'chars' : subtitleLayer.animation.splitMode;
      subtitleTargets = subtitleLayer.animation.splitMode === 'none' ? [subtitleEl] : subtitleSplit[targetKey];
    }

    // Trail clones — split and animate
    const validClones = cloneRefs.current
      .slice(0, activeTrailInstances)
      .filter(Boolean) as HTMLDivElement[];

    const cloneSplits = validClones.map((clone) =>
      new SplitText(clone, {
        type: getSplitType(titleLayer.animation.splitMode),
        charsClass: 'pelimotion-char-clone inline-block',
        wordsClass: 'pelimotion-word-clone inline-block',
        linesClass: 'pelimotion-line-clone inline-block',
      })
    );

    // Create master timeline
    const masterTl = createMasterTimeline({
      titleSplitTargets: titleTargets,
      titleWrapper: titleWrapperRef.current,
      subtitleSplitTargets: subtitleTargets,
      subtitleWrapper: subtitleWrapperRef.current,
      config: typoConfig,
    });

    // Add trail clone animations (uses legacy engine for compat)
    if (activeTrailInstances > 0 && titleTargets) {
      const isLeading = trailConfig.trailMode === 'leading';
      const targetKey = titleLayer.animation.splitMode === 'none' ? 'chars' : titleLayer.animation.splitMode;

      cloneSplits.forEach((cloneSplit, index) => {
        const cloneTargets = cloneSplit[targetKey];
        const cloneEntryTl = createTypographyTimeline(cloneTargets, {
          duration: titleLayer.animation.entryDuration,
          stagger: titleLayer.animation.entryStagger,
          ease: titleLayer.animation.entryEase,
          xOffset: 0, yOffset: 50, scale: 0.85, blur: 12, opacityStart: 0,
        });

        const offset = isLeading
          ? index * trailConfig.staggerDelay
          : (trailConfig.mainEntryDelay || 0) + (index + 1) * trailConfig.staggerDelay;

        masterTl.add(cloneEntryTl, offset);
      });

      // Leading mode: fade clones
      if (isLeading) {
        const entryEnd = titleLayer.animation.entryDelay + titleLayer.animation.entryDuration;
        cloneSplits.forEach((cloneSplit) => {
          masterTl.to(cloneSplit[targetKey], {
            opacity: 0, duration: 0.3, ease: 'power2.out',
          }, entryEnd);
        });
      }
    }

    _animatingRef.current = true;

    return () => {
      masterTl.kill();
    };
  }, {
    dependencies: [remountKey],
    scope: containerRef,
  });

  // ─── Draggable Setup ───────────────────────────────────────────────────

  useEffect(() => {
    if (layoutMode !== 'freeform') return;

    const draggables: Draggable[] = [];

    if (titleWrapperRef.current && titleLayer.enabled) {
      const d = Draggable.create(titleWrapperRef.current, {
        type: 'x,y',
        cursor: 'grab',
        activeCursor: 'grabbing',
        onDrag: function() {
          updateTitleTransform({ x: this.x, y: this.y });
        },
        onDragEnd: function() {
          updateTitleTransform({ x: this.x, y: this.y });
        },
      });
      draggables.push(...d);
    }

    if (subtitleWrapperRef.current && subtitleLayer.enabled) {
      const d = Draggable.create(subtitleWrapperRef.current, {
        type: 'x,y',
        cursor: 'grab',
        activeCursor: 'grabbing',
        onDrag: function() {
          updateSubtitleTransform({ x: this.x, y: this.y });
        },
        onDragEnd: function() {
          updateSubtitleTransform({ x: this.x, y: this.y });
        },
      });
      draggables.push(...d);
    }

    return () => {
      draggables.forEach(d => d.kill());
    };
  }, [layoutMode, titleLayer.enabled, subtitleLayer.enabled, updateTitleTransform, updateSubtitleTransform]);

  // ─── Deselect on click outside ─────────────────────────────────────────

  const handleContainerClick = useCallback(() => {
    setActiveTypoLayer(null);
  }, [setActiveTypoLayer]);

  // ─── Trail Clone Rendering ─────────────────────────────────────────────

  const allTrailSlots = Array.from({ length: MAX_TRAIL_INSTANCES }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* SVG Defs — Outer-stroke-only filter for trail */}
      <svg
        width="0" height="0"
        style={{ position: 'absolute', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id={strokeFilterId}
            x="-10%" y="-10%" width="120%" height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded" />
            <feComposite in="expanded" in2="SourceAlpha" operator="out" result="outerRing" />
            <feFlood floodColor={trailConfig.trailColor || '#ffffff'} floodOpacity="1" result="strokeColor" />
            <feComposite in="strokeColor" in2="outerRing" operator="in" />
          </filter>
        </defs>
      </svg>

      <div
        key={remountKey}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...(isFreeform ? { position: 'relative' as const, width: '100%', height: '100%' } : {}),
        }}
      >
        {/* ── Trail Clones (behind main text) ──────────────────────────── */}
        {allTrailSlots.map((i) => {
          const isVisible = i < activeTrailInstances;
          const isLeading = trailConfig.trailMode === 'leading';
          const { opacityDecay, scaleDecay, blurIncrement, blendMode, style: trailStyle, trailColor } = trailConfig;

          const opacity = isLeading ? 1 : Math.max(0, 1 - (i + 1) * opacityDecay);
          const instanceScale = isLeading
            ? (trailConfig.trailScaleMultiplier ?? 1)
            : Math.max(0.05, 1 - (i + 1) * scaleDecay) * (trailConfig.trailScaleMultiplier ?? 1);
          const baseBlur = isLeading ? 0 : (i + 1) * blurIncrement;
          const extraBlur = trailStyle === 'blur' && !isLeading ? 10 : 0;
          const totalBlur = baseBlur + extraBlur;

          const isStroke = trailStyle === 'stroke';
          let colorStyle = trailColor || '#ffffff';
          if (trailStyle === 'chromatic') {
            colorStyle = `hsl(${(i * 60) % 360}, 100%, 65%)`;
          }

          const parts: string[] = [];
          if ((trailConfig.trailOffsetX || 0) !== 0 || (trailConfig.trailOffsetY || 0) !== 0) {
            parts.push(`translate(${trailConfig.trailOffsetX || 0}px, ${trailConfig.trailOffsetY || 0}px)`);
          }
          parts.push(`scale(${instanceScale})`);
          if ((trailConfig.trailRotation || 0) !== 0) parts.push(`rotate(${trailConfig.trailRotation}deg)`);
          const transform = parts.join(' ');

          const filterValue = [
            isStroke ? `url(#${strokeFilterId})` : '',
            totalBlur > 0 ? `blur(${totalBlur}px)` : '',
          ].filter(Boolean).join(' ') || 'none';

          return (
            <div
              key={i}
              ref={(el) => { cloneRefs.current[i] = el; }}
              style={{
                position: 'absolute',
                inset: 0,
                display: isVisible ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
                mixBlendMode: blendMode as any,
                opacity,
                transform,
                filter: filterValue,
                color: isStroke ? (trailColor || '#ffffff') : colorStyle,
                whiteSpace: 'pre-wrap',
                textAlign: 'center',
              }}
            >
              <span style={{
                fontFamily: `'${titleLayer.fontFamily}', sans-serif`,
                fontWeight: titleLayer.fontWeight,
                fontSize: `${titleLayer.fontSize}rem`,
                letterSpacing: `${titleLayer.letterSpacing + (trailConfig.trailLetterSpacing ?? 0)}em`,
                lineHeight: titleLayer.lineHeight || 1,
                fontStyle: titleLayer.fontStyle || 'normal',
                textTransform: titleLayer.textTransform as any,
              }}>
                {titleLayer.text}
              </span>
            </div>
          );
        })}

        {/* ── Title Layer ──────────────────────────────────────────────── */}
        <LayerRenderer
          layer={titleLayer}
          innerRef={titleTextRef}
          wrapperRef={titleWrapperRef}
          isSelected={activeTypoLayerId === 'title'}
          onSelect={() => setActiveTypoLayer('title')}
          layoutStyle={{ ...layout.titleStyle, zIndex: 10 }}
          isDraggable={layoutMode === 'freeform'}
        />

        {/* ── Subtitle Layer ──────────────────────────────────────────── */}
        <LayerRenderer
          layer={subtitleLayer}
          innerRef={subtitleTextRef}
          wrapperRef={subtitleWrapperRef}
          isSelected={activeTypoLayerId === 'subtitle'}
          onSelect={() => setActiveTypoLayer('subtitle')}
          layoutStyle={{ ...layout.subtitleStyle, zIndex: 5 }}
          isDraggable={layoutMode === 'freeform'}
        />
      </div>
    </div>
  );
}
