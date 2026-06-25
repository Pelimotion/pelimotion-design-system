/**
 * UniversalCanvasPreview — Pelimotion v3.0
 *
 * Renders all UniversalLayer[] on the canvas.
 * Each layer type has its own renderer:
 *   - text: uses GSAP SplitText + animation engine
 *   - element: uses existing Generative engine shapes
 *   - overlay/shadow-guard/text-box: pure CSS/SVG renders
 */
import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { UniversalLayer } from '@/types/universalLayers.types';
import { gsap } from 'gsap';
import { renderGenerativeShape } from '@/engines/Generative/shapes';
import { createNoiseDriver } from '@/engines/Generative/noiseEngine';
import type { NoiseChannel, NoiseDriver } from '@/engines/Generative/noiseEngine';

// ─── Text Layer Renderer ─────────────────────────────────────────────────────

function TextLayerRenderer({ layer, isSelected }: { layer: UniversalLayer; isSelected: boolean }) {
  const d = layer.textData!;
  const t = layer.transform;
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { updateLayer } = useEditorStore();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleTriggerEdit = () => {
      setIsEditing(true);
    };
    el.addEventListener('trigger-text-edit', handleTriggerEdit);
    return () => el.removeEventListener('trigger-text-edit', handleTriggerEdit);
  }, []);

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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    const newText = e.currentTarget.innerText;
    updateLayer(layer.id, { textData: { ...d, text: newText } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  if (!layer.visible) return null;

  return (
    <div
      ref={ref}
      data-layer-id={layer.id}
      data-gizmo-target={isSelected ? 'active' : undefined}
      onDoubleClick={handleDoubleClick}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        transform: `translate(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px)) scale(${t.scale}) rotate(${t.rotation}deg)`,
        top: '50%', left: '50%',
        opacity: t.opacity,
        zIndex: layer.zIndex + 10,
        pointerEvents: (isSelected || isEditing) ? 'auto' : 'none',
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
        outline: isEditing ? '1.5px solid var(--color-accent)' : 'none',
        borderRadius: isEditing ? 4 : 0,
        padding: isEditing ? 4 : 0,
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

  return <div data-layer-id={layer.id} style={getStyle()} />;
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

  return <div data-layer-id={layer.id} style={getStyle()} />;
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

  return <div data-layer-id={layer.id} style={getBoxStyle()} />;
}

// ─── Element Colors Helper ───────────────────────────────────────────────────

function applyElementColors(container: HTMLElement, colorMode: string, colors: string[]) {
  let palette = colors && colors.length > 0 ? colors.filter(Boolean) : ['#a78bfa'];
  
  if (colorMode === 'duotone') {
    palette = ['var(--canvas-primary)', 'var(--canvas-accent)'];
  } else if (colorMode === 'tritone') {
    palette = ['var(--canvas-primary)', 'var(--canvas-accent)', 'var(--canvas-secondary)'];
  }

  const paintableEls = Array.from(container.querySelectorAll(
    'svg path, svg rect, svg circle, svg polygon, svg ellipse, svg line, svg polyline, svg text, svg use'
  )) as SVGElement[];

  paintableEls.forEach(el => {
    if (!el.hasAttribute('data-orig-fill-recorded')) {
      el.setAttribute('data-orig-fill', el.style.fill || '');
      el.setAttribute('data-orig-stroke', el.style.stroke || '');
      el.setAttribute('data-orig-color', el.style.color || '');
      el.setAttribute('data-orig-fill-recorded', 'true');
    }
  });

  paintableEls.forEach(el => {
    el.style.fill = el.getAttribute('data-orig-fill') || '';
    el.style.stroke = el.getAttribute('data-orig-stroke') || '';
    el.style.color = el.getAttribute('data-orig-color') || '';
  });

  if (colorMode === 'original') {
    return;
  }

  let colorIndex = 0;
  paintableEls.forEach(el => {
    const color = colorMode === 'solid' ? palette[0] || '#a78bfa' : palette[colorIndex % palette.length] || '#a78bfa';
    
    const isLine = el.tagName.toLowerCase() === 'line' || el.tagName.toLowerCase() === 'polyline';
    const hasFillNone = el.getAttribute('fill') === 'none' || el.getAttribute('data-orig-fill') === 'none';
    const isStrokeBased = isLine || hasFillNone;
    
    if (isStrokeBased) {
      el.style.stroke = color;
      el.style.fill = 'none';
    } else {
      el.style.fill = color;
      const originalStroke = el.getAttribute('stroke');
      if (originalStroke && originalStroke !== 'none') {
        el.style.stroke = color;
      } else {
        el.style.stroke = 'none';
      }
    }
    
    colorIndex++;
  });
}

// ─── Element Layer Renderer ──────────────────────────────────────────────────

function ElementLayerRenderer({ layer, isSelected }: { layer: UniversalLayer; isSelected: boolean }) {
  const d = layer.elementData!;
  const t = layer.transform;
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPlaying } = useEditorStore();
  const driversRef = useRef<Map<string, NoiseDriver>>(new Map());

  useEffect(() => {
    if (!containerRef.current || !layer.visible) return;
    const container = containerRef.current;
    
    applyElementColors(container, d.colorMode, d.colors);

    const baseChannels = ['x', 'y', 'rotation', 'scale', 'scaleX', 'scaleY', 'skew'] as const;
    const channels = d.opacityMode === 'wiggle-group'
      ? [...baseChannels, 'opacity' as const]
      : [...baseChannels];

    let groupTargets: Element[] = [];
    let pathTargets: Element[] = [];

    if (d.targetMode === 'group') {
      groupTargets = [container];
    } else {
      pathTargets = Array.from(container.querySelectorAll(
        'svg path, svg rect, svg circle, svg polygon, svg ellipse, svg line, svg polyline'
      ));
      if (pathTargets.length === 0) groupTargets = [container];
    }

    const motionTargets = groupTargets.length > 0 ? groupTargets : pathTargets;
    const currentDrivers = driversRef.current;
    
    currentDrivers.forEach(dr => dr.stop());
    currentDrivers.clear();

    const layerSeed = 12345;

    if (motionTargets.length > 0) {
      const driver = createNoiseDriver(motionTargets, {
        amplitude: d.noiseAmplitude,
        frequency: d.noiseFrequency,
        octaves: d.noiseOctaves,
        persistence: d.noisePersistence,
        noiseType: 'simplex2D',
        seed: layerSeed,
        channels: channels as NoiseChannel[],
        propertyFps: {},
        propertyAmplitudes: {},
        propertyFrequencies: {},
        targetMode: d.targetMode === 'group' ? 'group' : 'layers',
        colorMode: d.colorMode === 'original' ? 'solid' : d.colorMode as any,
        colors: d.colors,
        previewGrid: 'none',
      });
      currentDrivers.set(layer.id + '_motion', driver);
      if (isPlaying) driver.start();
    }

    if (d.opacityMode === 'wiggle-paths' && pathTargets.length > 0) {
      const opacityDriver = createNoiseDriver(pathTargets, {
        amplitude: 20,
        frequency: d.noiseFrequency,
        octaves: d.noiseOctaves,
        persistence: d.noisePersistence,
        noiseType: 'simplex2D',
        seed: layerSeed + 500,
        channels: ['opacity'],
        propertyFps: {},
        propertyAmplitudes: { opacity: 1 },
        propertyFrequencies: { opacity: 1 },
        targetMode: 'layers',
        colorMode: 'solid',
        colors: [],
        previewGrid: 'none',
      });
      currentDrivers.set(layer.id + '_opacity', opacityDriver);
      if (isPlaying) opacityDriver.start();
    }

    return () => {
      currentDrivers.forEach(dr => dr.stop());
      currentDrivers.clear();
    };
  }, [
    d.noiseAmplitude, d.noiseFrequency, d.noiseOctaves, d.noisePersistence,
    d.targetMode, d.opacityMode, d.colorMode, d.colors, layer.visible, isPlaying
  ]);

  if (!layer.visible) return null;

  const shapeColor = d.colors?.[0] || '#a78bfa';

  return (
    <div
      className="layer-base"
      data-layer-id={layer.id}
      data-gizmo-target={isSelected ? 'active' : undefined}
      style={{
        position: 'absolute',
        transform: `translate(calc(-50% + ${t.x}px), calc(-50% + ${t.y}px)) scale(${t.scale}) rotate(${t.rotation}deg)`,
        top: '50%', left: '50%',
        opacity: d.opacityMode === 'fixed' ? t.opacity : 1,
        width: 200, height: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: layer.zIndex + 10,
        pointerEvents: isSelected ? 'auto' : 'none',
      }}
    >
      <div
        ref={containerRef}
        className="gen-layer-container"
        style={{ width: '100%', height: '100%' }}
      >
        {d.shapeType === 'raw' && d.svgString ? (
          <div
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{ __html: d.svgString }}
          />
        ) : (
          <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            {renderGenerativeShape(
              { type: d.shapeType, shapeProps: d.shapeProps } as any,
              shapeColor
            )}
          </svg>
        )}
      </div>
    </div>
  );
}

// ─── UniversalCanvasPreview (Main Export) ─────────────────────────────────────

export function UniversalCanvasPreview() {
  const { layers, selectedLayerId } = useEditorStore();
  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      {sorted.map(layer => {
        if (!layer.visible) return null;
        const isSelected = selectedLayerId === layer.id;
        switch (layer.type) {
          case 'text':
            return <TextLayerRenderer key={layer.id} layer={layer} isSelected={isSelected} />;
          case 'overlay':
            return <OverlayLayerRenderer key={layer.id} layer={layer} />;
          case 'shadow-guard':
            return <ShadowGuardRenderer key={layer.id} layer={layer} />;
          case 'text-box':
            return <TextBoxRenderer key={layer.id} layer={layer} />;
          case 'element':
            return <ElementLayerRenderer key={layer.id} layer={layer} isSelected={isSelected} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
