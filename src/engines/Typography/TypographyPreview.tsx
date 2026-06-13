import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { createLayerTimeline, createIdleTimeline } from './typography.engine';

gsap.registerPlugin(useGSAP, SplitText, Draggable);

const MAX_TRAIL_INSTANCES = 12;
const allTrailSlots = Array.from({ length: MAX_TRAIL_INSTANCES }, (_, i) => i);

// ─────────────────────────────────────────────────────────────────────────────
// Single Layer Node — drag + gizmo target + trail rendering
// ─────────────────────────────────────────────────────────────────────────────

interface LayerProps {
  layer: any;
  trailConf: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateTransform: (patch: Record<string, number>) => void;
  innerRef: (el: HTMLDivElement | null) => void;
  cloneRef: (i: number, el: HTMLDivElement | null) => void;
  activeTrailInstances: number;
  strokeFilterId: string;
  animKey: string;
  layoutMode: string;
}

function LayerNode({
  layer, trailConf, isSelected, onSelect, onUpdateTransform,
  innerRef, cloneRef, activeTrailInstances, strokeFilterId, animKey, layoutMode,
}: LayerProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<any>(null);
  const isDraggingRef = useRef(false);

  const [boxW, setBoxW] = useState<number | null>(layer.transform.textBoxWidth ?? null);
  const [boxH, setBoxH] = useState<number | null>(layer.transform.textBoxHeight ?? null);

  useEffect(() => {
    setBoxW(layer.transform.textBoxWidth ?? null);
    setBoxH(layer.transform.textBoxHeight ?? null);
  }, [layer.transform.textBoxWidth, layer.transform.textBoxHeight]);

  // Stable callback refs — never recreate Draggable just because callbacks changed
  const callbacksRef = useRef({ onSelect, onUpdateTransform });
  useEffect(() => {
    callbacksRef.current = { onSelect, onUpdateTransform };
  }, [onSelect, onUpdateTransform]);

  // Create Draggable ONCE — never recreate
  useEffect(() => {
    if (!dragRef.current) return;
    const el = dragRef.current;

    const [d] = Draggable.create(el, {
      type: 'x,y',
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress() {
        callbacksRef.current.onSelect();
      },
      onDragStart() {
        isDraggingRef.current = true;
        callbacksRef.current.onSelect();
      },
      onDrag() {
        callbacksRef.current.onUpdateTransform({ x: (this as any).x, y: (this as any).y });
      },
      onDragEnd() {
        isDraggingRef.current = false;
        callbacksRef.current.onUpdateTransform({ x: (this as any).x, y: (this as any).y });
      },
    });
    draggableRef.current = d;

    return () => {
      if (d) d.kill();
      draggableRef.current = null;
    };
  }, []); // Created once per layer mount

  // Sync GSAP transform + enable/disable Draggable based on layout mode
  useEffect(() => {
    if (!dragRef.current || isDraggingRef.current) return;
    const el = dragRef.current;
    const d = draggableRef.current;

    if (layoutMode === 'freeform') {
      // Freeform: full GSAP control, Draggable enabled
      if (d && !d.enabled()) d.enable();
      gsap.set(el, {
        x: layer.transform.x,
        y: layer.transform.y,
        xPercent: -50,
        yPercent: -50,
        scale: layer.transform.scale,
        rotation: layer.transform.rotation,
        transformOrigin: 'center center',
      });
    } else {
      // Structured mode: CSS flex handles layout, GSAP only does scale/rotation
      // Disable drag — CSS layout manages position
      if (d && d.enabled()) d.disable();
      gsap.set(el, {
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        scale: layer.transform.scale,
        rotation: layer.transform.rotation,
        transformOrigin: 'center center',
      });
    }
  }, [layer.transform.x, layer.transform.y, layer.transform.scale, layer.transform.rotation, layoutMode]);



  const isFreeform = layoutMode === 'freeform';

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: boxW != null ? `${boxW}px` : 'max-content',
    height: boxH != null ? `${boxH}px` : 'auto',
    minWidth: 40,
    minHeight: 20,
  };

  const textStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    color: layer.color,
    fontFamily: `'${layer.fontFamily}', sans-serif`,
    fontWeight: layer.fontWeight,
    fontSize: `${layer.fontSize}cqw`,
    letterSpacing: `${layer.letterSpacing}em`,
    lineHeight: layer.lineHeight,
    fontStyle: layer.fontStyle,
    textTransform: layer.textTransform as any,
    textAlign: layer.textAlign as any,
    whiteSpace: boxW != null ? 'normal' : 'nowrap',
    overflowWrap: boxW != null ? 'break-word' : 'normal',
    width: '100%',
    height: '100%',
  };

  return (
    <div
      ref={dragRef}
      data-gizmo-target={isSelected ? 'active' : undefined}
      onPointerDown={(e) => {
        // Se não for freeform, o Draggable do GSAP está desativado e não dispara o onSelect.
        // Precisamos selecionar manualmente para que o Gizmo apareça.
        if (!isFreeform) {
          e.stopPropagation();
          onSelect();
        }
      }}
      style={{
        // Freeform: absolute, center-anchored via GSAP xPercent/yPercent
        // Structured: relative, participates in flex/grid flow
        position: isFreeform ? 'absolute' : 'relative',
        top: isFreeform ? '50%' : 'auto',
        left: isFreeform ? '50%' : 'auto',
        alignSelf: isFreeform ? undefined : 'center',
        zIndex: isSelected ? 20 : 10,
        cursor: isFreeform ? 'grab' : 'default',
      }}
    >
      {/* ── Bounding Box Gizmo for Active Layer ── */}
      {isSelected && isFreeform && (
        <div style={{
          position: 'absolute',
          top: -4, left: -4, right: -4, bottom: -4,
          border: '1px dashed var(--color-accent)',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          {/* Scale Handles */}
          <div style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, background: 'var(--color-bg-base)', border: '2px solid var(--color-accent)', cursor: 'nwse-resize', pointerEvents: 'auto' }} />
          <div style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, background: 'var(--color-bg-base)', border: '2px solid var(--color-accent)', cursor: 'nesw-resize', pointerEvents: 'auto' }} />
          <div style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, background: 'var(--color-bg-base)', border: '2px solid var(--color-accent)', cursor: 'nesw-resize', pointerEvents: 'auto' }} />
          <div style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, background: 'var(--color-bg-base)', border: '2px solid var(--color-accent)', cursor: 'nwse-resize', pointerEvents: 'auto' }} />
          
          {/* Rotation Handle */}
          <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', width: 2, height: 26, background: 'var(--color-accent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, background: 'var(--color-bg-base)', border: '2px solid var(--color-accent)', borderRadius: '50%', cursor: 'ew-resize', pointerEvents: 'auto' }} />
        </div>
      )}

      <div style={wrapperStyle}>
        <div style={{
          width: '100%', height: '100%',
          opacity: layer.transform.opacity,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          position: 'relative',
        }}>

          {/* SVG filter for stroke trail style */}
          {trailConf.enabled && trailConf.style === 'stroke' && (
            <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
              <defs>
                <filter id={strokeFilterId} x="-10%" y="-10%" width="120%" height="120%">
                  <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded" />
                  <feComposite in="expanded" in2="SourceAlpha" operator="out" result="outerRing" />
                  <feFlood floodColor={trailConf.trailColor || '#ffffff'} floodOpacity="1" result="strokeColor" />
                  <feComposite in="strokeColor" in2="outerRing" operator="in" />
                </filter>
              </defs>
            </svg>
          )}

          {/* Trail clones */}
          {trailConf.enabled && allTrailSlots.map((i) => {
            const isVisible = i < activeTrailInstances;
            const isLeading = trailConf.trailMode === 'leading';
            const opacity = isLeading ? 1 : Math.max(0, 1 - (i + 1) * trailConf.opacityDecay);
            const instanceScale = isLeading
              ? (trailConf.trailScaleMultiplier ?? 1)
              : Math.max(0.05, 1 - (i + 1) * trailConf.scaleDecay) * (trailConf.trailScaleMultiplier ?? 1);
            const isStroke = trailConf.style === 'stroke';
            const colorStyle = trailConf.style === 'chromatic'
              ? `hsl(${(i * 60) % 360}, 100%, 65%)`
              : (trailConf.trailColor || '#ffffff');

            const parts: string[] = [];
            if ((trailConf.trailOffsetX || 0) !== 0 || (trailConf.trailOffsetY || 0) !== 0) {
              parts.push(`translate(${trailConf.trailOffsetX ?? 0}px, ${trailConf.trailOffsetY ?? 0}px)`);
            }
            parts.push(`scale(${instanceScale})`);
            if ((trailConf.trailRotation || 0) !== 0) parts.push(`rotate(${trailConf.trailRotation}deg)`);

            return (
              <div
                key={`${i}-${animKey}`}
                ref={(el) => cloneRef(i, el)}
                style={{
                  position: 'absolute', inset: 0,
                  display: isVisible ? 'flex' : 'none',
                  alignItems: 'center',
                  justifyContent: layer.textAlign === 'left' ? 'flex-start' : layer.textAlign === 'right' ? 'flex-end' : 'center',
                  pointerEvents: 'none', userSelect: 'none',
                  mixBlendMode: trailConf.blendMode as any,
                  opacity,
                  transform: parts.join(' ') || undefined,
                  filter: isStroke ? `url(#${strokeFilterId})` : 'none',
                  color: isStroke ? (trailConf.trailColor || '#ffffff') : colorStyle,
                  overflow: 'visible',
                }}
              >
                <span style={{
                  ...textStyle,
                  color: isStroke ? (trailConf.trailColor || '#ffffff') : colorStyle,
                  letterSpacing: `${layer.letterSpacing + (trailConf.trailLetterSpacing ?? 0)}em`,
                  zIndex: 1,
                }}>
                  {layer.text}
                </span>
              </div>
            );
          })}

          {/* Main text element — animated by GSAP SplitText */}
          <div key={animKey} ref={innerRef} style={textStyle}>
            {layer.text}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Preview Component
// ─────────────────────────────────────────────────────────────────────────────

export function TypographyPreview({ overrideConfig }: { overrideConfig?: any }) {
  const store = useEditorStore();
  const motionConfig = store.motionConfig;
  
  const activeTypoLayerId = overrideConfig ? null : store.activeTypoLayerId;
  const setActiveTypoLayer = overrideConfig ? () => {} : store.setActiveTypoLayer;
  const updateTypoLayerTransform = overrideConfig ? () => {} : store.updateTypoLayerTransform;
  const animForceKey = overrideConfig ? 'static' : store.animForceKey;

  const containerRef = useRef<HTMLDivElement>(null);
  const globalWrapperRef = useRef<HTMLDivElement>(null);
  const innerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const cloneRefs = useRef<Record<string, (HTMLDivElement | null)[]>>({});
  // Track SplitText instances for proper cleanup
  const splitInstances = useRef<SplitText[]>([]);

  const typoConfig = overrideConfig || motionConfig.typography;
  const { layers, layoutMode, layoutGap, timeOnScreen: baseTimeOnScreen } = typoConfig;
  const globalTrail = overrideConfig?.trail || motionConfig.trail;
  
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);

  // animKey: changing this forces the GSAP timeline to rebuild
  // Includes animForceKey so the "Reiniciar Efeito" button works
  const animKey = JSON.stringify({
    forceKey: animForceKey,
    globalTrail,
    layers: layers.map((l: any) => ({
      id: l.id, text: l.text,
      font: [l.fontFamily, l.fontWeight, l.fontSize, l.letterSpacing, l.lineHeight, l.fontStyle, l.textTransform, l.color, l.textAlign],
      anim: l.animation,
      trail: l.trail?.enabled ? l.trail : null,
    })),
  });

  useGSAP(() => {
    // Revert any previous SplitText instances before rebuilding
    splitInstances.current.forEach(s => { try { s.revert(); } catch {} });
    splitInstances.current = [];

    const layerOpts = layers.map((layer: any) => {
      if (!layer.enabled) return null;
      const el = innerRefs.current[layer.id];
      if (!el) return null;

      const anim = layer.animation;
      const trailConf = layer.trail || globalTrail;

      let splitTargets: HTMLElement[] = [el];
      if (anim.splitMode !== 'none') {
        const splitType = anim.splitMode === 'chars' ? 'chars,words' : anim.splitMode === 'words' ? 'words' : 'lines';
        const split = new SplitText(el, { type: splitType });
        splitInstances.current.push(split);
        splitTargets = (split as any)[anim.splitMode] || [el];
      }

      const activeTrailInstances = trailConf.enabled ? Math.min(trailConf.instances, MAX_TRAIL_INSTANCES) : 0;
      const cloneArr = cloneRefs.current[layer.id] || [];
      const cloneTargets: HTMLElement[][] = [];

      for (let i = 0; i < activeTrailInstances; i++) {
        const cloneEl = cloneArr[i];
        if (cloneEl) {
          if (anim.splitMode !== 'none') {
            const splitType = anim.splitMode === 'chars' ? 'chars,words' : anim.splitMode === 'words' ? 'words' : 'lines';
            const cSplit = new SplitText(cloneEl, { type: splitType });
            splitInstances.current.push(cSplit);
            cloneTargets.push((cSplit as any)[anim.splitMode] || [cloneEl]);
          } else {
            cloneTargets.push([cloneEl]);
          }
        }
      }

      return {
        layer,
        splitTargets: splitTargets as any,
        cloneTargets,
        trailConf,
        wrapperTarget: el.parentElement as any,
      };
    }).filter(Boolean) as any[];

    const isContext = !!overrideConfig?.playbackContext;
    const masterTl = gsap.timeline({ repeat: isContext ? 0 : -1, repeatDelay: isContext ? 0 : 0.6 });
    masterTlRef.current = masterTl;

    layerOpts.forEach(({ layer, splitTargets, cloneTargets, trailConf, wrapperTarget }) => {
      gsap.set(wrapperTarget, { clearProps: 'all' });

      const layerTl = createLayerTimeline({
        splitTargets,
        wrapperTarget,
        layer,
        timeOnScreen: baseTimeOnScreen,
        totalDuration: overrideConfig?.playbackContext?.duration,
      });

      if (trailConf.enabled && cloneTargets.length > 0) {
        const isLeading = trailConf.trailMode === 'leading';
        cloneTargets.forEach((cTargets: any, i: number) => {
          const delayOffset = isLeading
            ? i * trailConf.staggerDelay
            : trailConf.mainEntryDelay + i * trailConf.staggerDelay;
          const cloneTl = createLayerTimeline({
            splitTargets: cTargets,
            wrapperTarget: cTargets[0]?.parentElement || cTargets,
            layer,
            timeOnScreen: baseTimeOnScreen,
            totalDuration: overrideConfig?.playbackContext?.duration,
          });
          masterTl.add(cloneTl, delayOffset);
        });
      }

      masterTl.add(layerTl, 0);
    });

    if (typoConfig.globalIdleMotion && typoConfig.globalIdleMotion !== 'none' && globalWrapperRef.current) {
      gsap.set(globalWrapperRef.current, { clearProps: 'all' });

      const globalAnim = {
        idleMotion: typoConfig.globalIdleMotion,
        idleSpeed: 1,
        idleIntensity: 1,
      };
      const maxTotalDuration = overrideConfig?.playbackContext 
        ? overrideConfig.playbackContext.duration
        : Math.max(
            ...layers.map((l: any) => l.animation.entryDuration + baseTimeOnScreen + l.animation.exitDuration),
            3
          );
      const idleTl = createIdleTimeline(globalWrapperRef.current, globalAnim, maxTotalDuration);
      masterTl.add(idleTl, 0);
    }

    return () => {
      masterTl.kill();
      // Revert SplitText on cleanup to keep DOM clean
      splitInstances.current.forEach(s => { try { s.revert(); } catch {} });
      splitInstances.current = [];
      masterTlRef.current = null;
    };
  }, { dependencies: [animKey, baseTimeOnScreen, typoConfig.globalIdleMotion, overrideConfig?.playbackContext?.duration], scope: containerRef });

  // Sync GSAP with React state (Export / Timeline scrub)
  useEffect(() => {
    if (overrideConfig?.playbackContext && masterTlRef.current) {
      const { localTime, isPlaying } = overrideConfig.playbackContext;
      
      if (!isPlaying) {
        masterTlRef.current.pause();
        masterTlRef.current.seek(localTime);
      } else {
        masterTlRef.current.play();
        // Sync GSAP absolute time if it drifted (e.g., from unpausing)
        const expectedTime = gsap.globalTimeline.time() - masterTlRef.current.startTime();
        if (Math.abs(expectedTime - localTime) > 0.05) {
          masterTlRef.current.startTime(gsap.globalTimeline.time() - localTime);
        }
      }
    }
  }, [overrideConfig?.playbackContext?.localTime, overrideConfig?.playbackContext?.isPlaying]);

  const handleContainerPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.target === containerRef.current || e.target === globalWrapperRef.current) {
      setActiveTypoLayer(null);
    }
  }, [setActiveTypoLayer]);

  // Layout container styles
  // CRITICAL: freeform = block (absolute children), structured = flex/grid
  const isFreeform = layoutMode === 'freeform';
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: isFreeform ? 'block' : ((layoutMode as string) === 'grid' ? 'grid' : 'flex'),
    flexDirection: layoutMode === 'stack' ? 'column' : 'row',
    alignItems: isFreeform ? undefined : (typoConfig.layoutAlignItems || 'center'),
    justifyContent: isFreeform ? undefined : (typoConfig.layoutJustifyContent || 'center'),
    gap: isFreeform ? undefined : `${layoutGap}px`,
    gridTemplateColumns: (layoutMode as string) === 'grid' ? 'repeat(auto-fit, minmax(200px, 1fr))' : undefined,
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleContainerPointerDown}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <div ref={globalWrapperRef} style={{ ...containerStyle, height: '100%' }}>
        {layers.map((layer: any) => {
          if (!layer.enabled) return null;
          const trailConf = layer.trail || globalTrail;
          const isSelected = activeTypoLayerId === layer.id;
          const activeTrailInstances = trailConf.enabled ? Math.min(trailConf.instances, MAX_TRAIL_INSTANCES) : 0;
          const strokeFilterId = `peli-stroke-${layer.id}`;

          if (!cloneRefs.current[layer.id]) cloneRefs.current[layer.id] = [];

          // Create a layer-specific animKey to avoid rebuilding all layers when only one changes
          const layerAnimKey = JSON.stringify({
            forceKey: animForceKey,
            text: layer.text,
            font: [layer.fontFamily, layer.fontWeight, layer.fontSize, layer.letterSpacing, layer.lineHeight, layer.fontStyle, layer.textTransform, layer.color, layer.textAlign],
            anim: layer.animation,
            trail: trailConf.enabled ? trailConf : null,
          });

          return (
            <LayerNode
              key={layer.id}
              animKey={layerAnimKey}
              layer={layer}
              trailConf={trailConf}
              isSelected={isSelected}
              layoutMode={layoutMode}
              onSelect={() => setActiveTypoLayer(layer.id)}
              onUpdateTransform={(patch) => updateTypoLayerTransform(layer.id, patch)}
              innerRef={(el) => { innerRefs.current[layer.id] = el; }}
              cloneRef={(i, el) => { if (cloneRefs.current[layer.id]) cloneRefs.current[layer.id]![i] = el; }}
              activeTrailInstances={activeTrailInstances}
              strokeFilterId={strokeFilterId}
            />
          );
        })}
      </div>
    </div>
  );
}
