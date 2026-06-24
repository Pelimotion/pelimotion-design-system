/**
 * UniversalCanvasPreview — Pelimotion v3.0
 *
 * Renders all UniversalLayer[] on the canvas.
 * Each layer type has its own renderer:
 *   - text: uses GSAP SplitText + animation engine
 *   - element: uses existing Generative engine shapes
 *   - overlay/shadow-guard/text-box: pure CSS/SVG renders
 */
import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { UniversalLayer } from '@/types/universalLayers.types';
import { gsap } from 'gsap';

// ─── Text Layer Renderer ─────────────────────────────────────────────────────

function TextLayerRenderer({ layer }: { layer: UniversalLayer }) {
  const d = layer.textData!;
  const t = layer.transform;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !layer.visible) return;
    const el = ref.current;

    // Entry animation
    if (layer.animation.entryPreset !== 'none') {
      const from: gsap.TweenVars = { opacity: 0 };
      if (layer.animation.entryPreset === 'fadeUp') { from.y = 30; }
      if (layer.animation.entryPreset === 'fadeDown') { from.y = -30; }
      if (layer.animation.entryPreset === 'slideLeft') { from.x = 60; }
      if (layer.animation.entryPreset === 'slideRight') { from.x = -60; }
      if (layer.animation.entryPreset === 'scaleIn') { from.scale = 0.7; }
      if (layer.animation.entryPreset === 'blurIn') { from.filter = 'blur(20px)'; }

      gsap.fromTo(el, from, {
        opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)',
        duration: layer.animation.entryDuration,
        delay: layer.animation.entryDelay,
        ease: layer.animation.entryEase,
      });
    }

    // Auto-animate
    if (layer.animation.autoAnimate) {
      const intensity = layer.animation.autoAnimateIntensity / 100;
      const preset = layer.animation.autoAnimatePreset;
      const duration = 1.5 + (1 - intensity) * 2;

      if (preset === 'float') {
        gsap.to(el, { y: `-=${8 * intensity}`, repeat: -1, yoyo: true, duration, ease: 'sine.inOut' });
      } else if (preset === 'pulse') {
        gsap.to(el, { scale: 1 + 0.05 * intensity, repeat: -1, yoyo: true, duration: duration * 0.7, ease: 'power2.inOut' });
      } else if (preset === 'wiggle') {
        gsap.to(el, { rotation: 3 * intensity, repeat: -1, yoyo: true, duration: 0.2 + (1 - intensity) * 0.4, ease: 'sine.inOut' });
      } else if (preset === 'breathe') {
        gsap.to(el, { scale: 1 + 0.03 * intensity, opacity: 0.9 + 0.1 * (1 - intensity), repeat: -1, yoyo: true, duration: duration * 1.2, ease: 'sine.inOut' });
      } else if (preset === 'bounce') {
        gsap.to(el, { y: `-=${12 * intensity}`, repeat: -1, yoyo: true, duration: duration * 0.5, ease: 'power2.out' });
      }
    }

    return () => gsap.killTweensOf(el);
  }, [layer.animation, layer.visible]);

  if (!layer.visible) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        transform: `translate(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px)) scale(${t.scale}) rotate(${t.rotation}deg)`,
        top: '50%', left: '50%',
        opacity: t.opacity,
        zIndex: layer.zIndex + 10,
        pointerEvents: 'none',
        textAlign: d.textAlign,
        color: d.color,
        fontFamily: `'${d.fontFamily}', sans-serif`,
        fontWeight: d.fontWeight,
        fontSize: `${d.fontSize}cqw`,
        letterSpacing: `${d.letterSpacing}em`,
        lineHeight: d.lineHeight,
        textTransform: d.textTransform,
        fontStyle: d.fontStyle,
        maxWidth: `${d.maxWidth}%`,
        width: `${d.maxWidth}%`,
        wordBreak: 'break-word',
      } as React.CSSProperties}
    >
      {d.text}
    </div>
  );
}

// ─── Overlay Layer Renderer ──────────────────────────────────────────────────

function OverlayLayerRenderer({ layer }: { layer: UniversalLayer }) {
  if (!layer.visible) return null;
  const d = layer.overlayData!;
  const alpha = d.intensity / 100;

  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute', inset: 0, zIndex: layer.zIndex + 10, pointerEvents: 'none',
    };

    switch (d.overlayStyle) {
      case 'gradient-top':
        return { ...base, background: `linear-gradient(to bottom, ${d.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)` };
      case 'gradient-bottom':
        return { ...base, background: `linear-gradient(to top, ${d.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)` };
      case 'gradient-radial':
        return { ...base, background: `radial-gradient(ellipse at center, transparent 40%, ${d.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')} 100%)` };
      case 'noise-overlay':
        return { ...base, opacity: alpha * 0.2, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '150px' };
      case 'grain-overlay':
        return { ...base, opacity: alpha * 0.15, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '80px' };
      case 'light-leak':
        return { ...base, background: `radial-gradient(ellipse at top right, hsla(30,100%,60%,${alpha * 0.4}) 0%, hsla(45,100%,70%,${alpha * 0.15}) 30%, transparent 60%)`, mixBlendMode: 'screen' };
      default:
        return base;
    }
  };

  return <div style={getStyle()} />;
}

// ─── Shadow Guard Renderer ───────────────────────────────────────────────────

function ShadowGuardRenderer({ layer }: { layer: UniversalLayer }) {
  if (!layer.visible) return null;
  const d = layer.shadowGuardData!;
  const alpha = d.intensity / 100;
  const colorHex = Math.round(alpha * 255).toString(16).padStart(2, '0');

  const getStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute', zIndex: layer.zIndex + 10, pointerEvents: 'none', left: 0, right: 0,
    };

    switch (d.guardStyle) {
      case 'text-protection-bottom':
        return { ...base, bottom: 0, height: `${d.height}%`, background: `linear-gradient(to top, ${d.color}${colorHex} 0%, transparent 100%)` };
      case 'text-protection-top':
        return { ...base, top: 0, height: `${d.height}%`, background: `linear-gradient(to bottom, ${d.color}${colorHex} 0%, transparent 100%)` };
      case 'vignette-soft':
        return { ...base, inset: 0, background: `radial-gradient(ellipse at center, transparent 50%, ${d.color}${colorHex} 100%)` };
      case 'vignette-hard':
        return { ...base, inset: 0, background: `radial-gradient(ellipse at center, transparent 30%, ${d.color}${colorHex} 80%)` };
      default:
        return base;
    }
  };

  return <div style={getStyle()} />;
}

// ─── Text Box Renderer ───────────────────────────────────────────────────────

function TextBoxRenderer({ layer }: { layer: UniversalLayer }) {
  if (!layer.visible) return null;
  const d = layer.textBoxData!;
  const t = layer.transform;

  const getBoxStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      top: '50%', left: '50%',
      transform: `translate(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px)) scale(${t.scale}) rotate(${t.rotation}deg)`,
      opacity: t.opacity,
      zIndex: layer.zIndex + 10,
      pointerEvents: 'none',
      backgroundColor: d.backgroundColor,
      borderRadius: d.borderRadius,
      padding: d.padding,
      border: `${d.borderWidth}px solid ${d.borderColor}`,
      minWidth: '20%', minHeight: 40,
    };

    if (d.blur > 0) {
      base.backdropFilter = `blur(${d.blur}px)`;
      base.WebkitBackdropFilter = `blur(${d.blur}px)`;
    }

    if (d.boxStyle === 'pill-blur' || d.boxStyle === 'rectangle-glass') {
      base.background = d.backgroundColor;
    }

    return base;
  };

  return <div style={getBoxStyle()} />;
}

// ─── UniversalCanvasPreview (Main Export) ─────────────────────────────────────

export function UniversalCanvasPreview() {
  const { layers } = useEditorStore();
  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      {sorted.map(layer => {
        if (!layer.visible) return null;
        switch (layer.type) {
          case 'text':
            return <TextLayerRenderer key={layer.id} layer={layer} />;
          case 'overlay':
            return <OverlayLayerRenderer key={layer.id} layer={layer} />;
          case 'shadow-guard':
            return <ShadowGuardRenderer key={layer.id} layer={layer} />;
          case 'text-box':
            return <TextBoxRenderer key={layer.id} layer={layer} />;
          case 'element':
            // Element layers are handled by the existing Generative engine
            // This is a placeholder – integrated via GenerativePreview adapter
            return null;
          default:
            return null;
        }
      })}
    </div>
  );
}
