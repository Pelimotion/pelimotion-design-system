/**
 * GenerativePreview — Phase 4 (Per-Layer Architecture)
 *
 * Each GenerativeLayer now has its own:
 *   - colorMode + colors (solid / duotone / tritone / original)
 *   - targetMode (group | paths)
 *   - opacityMode (fixed | wiggle-group | wiggle-paths)
 *   - Independent NoiseDriver instance
 *
 * The colorization logic always resets previous inline styles before applying
 * new colors, preventing the "ghost color" bug when switching modes.
 */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { createNoiseDriver, type NoiseDriver } from '../Generative/noiseEngine'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { useGSAP } from '@gsap/react'
import { renderGenerativeShape } from './shapes'
import type { GenerativeLayer } from '@/types/motion.types'

gsap.registerPlugin(useGSAP, Draggable)

// ── Aspect Ratio Grid Overlay ─────────────────────────────────────────────────

function AspectRatioGrid({ ratio, label, color = 'rgba(255,255,255,0.2)' }: {
  ratio: number; label: string; color?: string
}) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: ratio > 1 ? '90%' : `calc(90% * ${ratio})`,
      height: ratio > 1 ? `calc(90% / ${ratio})` : '90%',
      border: `1px dashed ${color}`,
      pointerEvents: 'none',
      zIndex: 0,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
      padding: 4
    }}>
      <span style={{ fontSize: '0.6rem', color, fontWeight: 700, letterSpacing: 1 }}>{label}</span>
    </div>
  )
}

// ── Per-layer SVG Colorizer ───────────────────────────────────────────────────

function applyLayerColors(container: HTMLElement, layer: GenerativeLayer) {
  const { colorMode, colors } = layer
  
  // Base palette from user choice if solid
  let palette = colors && colors.length > 0 ? colors.filter(Boolean) : ['#a78bfa']
  
  // Override for duotone and tritone to lock to global palette
  if (colorMode === 'duotone') {
    palette = ['var(--canvas-primary)', 'var(--canvas-accent)']
  } else if (colorMode === 'tritone') {
    palette = ['var(--canvas-primary)', 'var(--canvas-accent)', 'var(--canvas-secondary)']
  }

  // Gather all paintable SVG elements
  const paintableEls = Array.from(container.querySelectorAll(
    'svg path, svg rect, svg circle, svg polygon, svg ellipse, svg line, svg polyline, svg text, svg use'
  )) as SVGElement[]

  paintableEls.forEach(el => {
    // Save original inline styles the very first time
    if (!el.hasAttribute('data-orig-fill-recorded')) {
      el.setAttribute('data-orig-fill', el.style.fill || '')
      el.setAttribute('data-orig-stroke', el.style.stroke || '')
      el.setAttribute('data-orig-color', el.style.color || '')
      el.setAttribute('data-orig-fill-recorded', 'true')
    }
  })

  // Restore to original styles
  paintableEls.forEach(el => {
    el.style.fill = el.getAttribute('data-orig-fill') || ''
    el.style.stroke = el.getAttribute('data-orig-stroke') || ''
    el.style.color = el.getAttribute('data-orig-color') || ''
  })

  if (colorMode === 'original') {
    return
  }

  // Apply colors
  let colorIndex = 0
  paintableEls.forEach(el => {
    const color = colorMode === 'solid' ? palette[0] || '#a78bfa' : palette[colorIndex % palette.length] || '#a78bfa'
    
    // Determine if element is stroke-based
    const isLine = el.tagName.toLowerCase() === 'line' || el.tagName.toLowerCase() === 'polyline'
    const hasFillNone = el.getAttribute('fill') === 'none' || el.getAttribute('data-orig-fill') === 'none'
    const isStrokeBased = isLine || hasFillNone
    
    if (isStrokeBased) {
      el.style.stroke = color
      el.style.fill = 'none'
    } else {
      el.style.fill = color
      const originalStroke = el.getAttribute('stroke')
      if (originalStroke && originalStroke !== 'none') {
        el.style.stroke = color
      } else {
        el.style.stroke = 'none'
      }
    }
    
    colorIndex++
  })
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function GenerativePreview({ overrideConfig }: { overrideConfig?: any }) {
  const store = useEditorStore()
  
  const motionConfig = overrideConfig ? overrideConfig.motionConfig : store.motionConfig
  const generativeLayers = overrideConfig ? overrideConfig.generativeLayers : store.generativeLayers
  const activeGenerativeLayerId = overrideConfig ? null : store.activeGenerativeLayerId
  const setActiveGenerativeLayerId = overrideConfig ? () => {} : store.setActiveGenerativeLayerId
  const updateLayerTransform = overrideConfig ? () => {} : store.updateLayerTransform
  const {
    amplitude, frequency, octaves, persistence, noiseType, seed,
    propertyFps, propertyAmplitudes, propertyFrequencies, previewGrid
  } = motionConfig.wiggle

  // Map<layerId, { driver, container }>
  const driversRef = useRef<Map<string, NoiseDriver>>(new Map())
  // Refs for each layer's container div
  const layerRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())
  
  const isPlaying = overrideConfig?.playbackContext ? overrideConfig.playbackContext.isPlaying : store.isPlaying
  
  // ── Per-Layer Engine Boot ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    // Stop & clear all previous drivers
    driversRef.current.forEach(d => d.stop())
    driversRef.current.clear()

    generativeLayers.forEach((layer: any, i: number) => {
      const container = layerRefsMap.current.get(layer.id)
      if (!container) return

      // 1. Apply colors
      applyLayerColors(container, layer)

      // 2. Build noise channels based on opacityMode
      const baseChannels = ['x', 'y', 'rotation', 'scale', 'scaleX', 'scaleY', 'skew'] as const
      const channels = layer.opacityMode === 'wiggle-group'
        ? [...baseChannels, 'opacity' as const]
        : [...baseChannels]

      // 3. Select targets based on targetMode + opacityMode
      let groupTargets: Element[] = []
      let pathTargets: Element[] = []

      if (layer.targetMode === 'group') {
        groupTargets = [container]
      } else {
        // 'paths' — individual SVG elements
        pathTargets = Array.from(container.querySelectorAll(
          'svg path, svg rect, svg circle, svg polygon, svg ellipse, svg line, svg polyline'
        ))
        // If no individual paths found, fall back to group
        if (pathTargets.length === 0) groupTargets = [container]
      }

      // 4. For wiggle-paths opacity, we create a separate driver for paths only for opacity channel
      const layerSeed = (layer.wiggle?.seed ?? seed) + i * 137 // unique seed per layer

      // Determine local wiggle parameters
      const localWiggle = layer.wiggle || {}
      const lAmplitude = localWiggle.amplitude ?? amplitude
      const lFrequency = localWiggle.frequency ?? frequency
      const lOctaves = localWiggle.octaves ?? octaves
      const lPersistence = localWiggle.persistence ?? persistence
      const lNoiseType = localWiggle.noiseType ?? noiseType

      // Main driver (for motion)
      const motionTargets = groupTargets.length > 0 ? groupTargets : pathTargets
      if (motionTargets.length > 0) {
        const driver = createNoiseDriver(motionTargets, {
          amplitude: lAmplitude, 
          frequency: lFrequency, 
          octaves: lOctaves, 
          persistence: lPersistence, 
          noiseType: lNoiseType,
          seed: layerSeed,
          channels: channels as any,
          propertyFps: propertyFps || {},
          propertyAmplitudes: propertyAmplitudes || {},
          propertyFrequencies: propertyFrequencies || {},
          targetMode: layer.targetMode === 'group' ? 'group' : 'layers',
          colorMode: 'solid', // handled separately by applyLayerColors
          colors: [],
          previewGrid: previewGrid || 'none',
        })
        driversRef.current.set(layer.id + '_motion', driver)
        if (isPlaying) driver.start()
      }

      // Paths-level wiggle opacity driver (separate, only opacity channel, targets individual paths)
      if (layer.opacityMode === 'wiggle-paths' && pathTargets.length > 0) {
        const opacityDriver = createNoiseDriver(pathTargets, {
          amplitude: 20, // normalized for opacity
          frequency: lFrequency, 
          octaves: lOctaves, 
          persistence: lPersistence, 
          noiseType: lNoiseType,
          seed: layerSeed + 500,
          channels: ['opacity'],
          propertyFps: propertyFps || {},
          propertyAmplitudes: { opacity: propertyAmplitudes?.opacity ?? 1 },
          propertyFrequencies: { opacity: propertyFrequencies?.opacity ?? 1 },
          targetMode: 'layers',
          colorMode: 'solid',
          colors: [],
          previewGrid: 'none',
        })
        driversRef.current.set(layer.id + '_opacity', opacityDriver)
        if (isPlaying) opacityDriver.start()
      }
    })

    return () => {
      driversRef.current.forEach(d => d.stop())
      driversRef.current.clear()
    }
  }, [
    generativeLayers, amplitude, frequency, octaves, persistence,
    noiseType, seed, propertyFps, propertyAmplitudes, propertyFrequencies, isPlaying
  ])

  // ── Play / Pause ──────────────────────────────────────────────────────────────
  useEffect(() => {
    driversRef.current.forEach(d => {
      if (isPlaying) d.start()
      else d.stop()
    })
  }, [isPlaying])

  // ── Draggable Setup ──────────────────────────────────────────────────────────
  const callbacksRef = useRef({ updateLayerTransform, setActiveGenerativeLayerId });
  useEffect(() => {
    callbacksRef.current = { updateLayerTransform, setActiveGenerativeLayerId };
  }, [updateLayerTransform, setActiveGenerativeLayerId]);

  useEffect(() => {
    const draggables: Draggable[] = [];
    generativeLayers.forEach((layer: any) => {
      const el = layerRefsMap.current.get(layer.id)?.parentElement; // The layer-base div
      if (el) {
        gsap.set(el, {
          x: layer.transform.x,
          y: layer.transform.y,
          scale: layer.transform.scale,
          rotation: layer.transform.rotation,
          xPercent: -50,
          yPercent: -50,
          transformOrigin: 'center center'
        });

        const d = Draggable.create(el, {
          type: 'x,y',
          cursor: 'grab',
          activeCursor: 'grabbing',
          onPress: () => {
            callbacksRef.current.setActiveGenerativeLayerId(layer.id);
          },
          onDragStart: () => {
            callbacksRef.current.setActiveGenerativeLayerId(layer.id);
          },
          onDrag: function() {
            callbacksRef.current.updateLayerTransform(layer.id, { x: this.x, y: this.y });
          },
          onDragEnd: function() {
            callbacksRef.current.updateLayerTransform(layer.id, { x: this.x, y: this.y });
          },
        });
        draggables.push(...d);
      }
    });

    return () => {
      draggables.forEach(d => d.kill());
    };
  }, [generativeLayers.length]); // Only rebind when layers are added/removed

  // Sync state changes to GSAP
  useEffect(() => {
    if (overrideConfig) return; // Don't sync internal transforms if override is provided, or do it statically
    generativeLayers.forEach((layer: any) => {
      const el = layerRefsMap.current.get(layer.id)?.parentElement;
      if (el) {
        gsap.set(el, {
          x: layer.transform.x,
          y: layer.transform.y,
          scale: layer.transform.scale,
          rotation: layer.transform.rotation,
        });
      }
    });
  }, [generativeLayers, overrideConfig]);

  return (
    <div
      onClick={() => setActiveGenerativeLayerId(null)}
      style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        .gen-layer-container svg { overflow: visible !important; }
        .gen-layer-container svg * { transition: none !important; }
      `}</style>

      {/* ── ASPECT RATIO GRIDS ── */}
      {previewGrid === '16:9' || previewGrid === 'all' ? <AspectRatioGrid ratio={1920/1080} label="16:9" color="rgba(255, 100, 100, 0.4)" /> : null}
      {previewGrid === '1:1' || previewGrid === 'all' ? <AspectRatioGrid ratio={1} label="1:1" color="rgba(100, 255, 100, 0.4)" /> : null}
      {previewGrid === '9:16' || previewGrid === 'all' ? <AspectRatioGrid ratio={1080/1920} label="9:16" color="rgba(100, 100, 255, 0.4)" /> : null}
      {previewGrid === '4:5' || previewGrid === 'all' ? <AspectRatioGrid ratio={1080/1350} label="4:5" color="rgba(255, 200, 100, 0.4)" /> : null}

      {/* Play / Pause - Hide if in override mode */}
      {!overrideConfig && (
        <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 50 }}>
          <button
            onClick={() => store.togglePlayback()}
            style={{
              background: isPlaying ? 'var(--color-surface-glass)' : 'var(--color-bg-elevated)',
              color: isPlaying ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: '1px solid var(--color-surface-border)',
              padding: '6px 12px',
              borderRadius: 4,
              fontSize: '0.7rem',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸ Pausar' : '▶ Animar'}
          </button>
        </div>
      )}

      {/* Layers Container (Free Canvas) */}
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: overrideConfig ? 'none' : 'auto' }}>
        {generativeLayers.map((layer: any) => {
          const { transform, type, svgString, animation } = layer
          // For built-in shapes, use first layer color for initial render; noise colors applied via applyLayerColors
          const shapeColor = (layer.colors && layer.colors[0]) || '#a78bfa'
          const isActive = layer.id === activeGenerativeLayerId

          // Calculate Layer-specific Transition
          let layerTransitionStyle: React.CSSProperties = {}
          if (overrideConfig?.playbackContext) {
            const { localTime, duration } = overrideConfig.playbackContext
            const entryDuration = animation?.entryDuration ?? 0.5
            const exitDuration = animation?.exitDuration ?? 0.5
            
            let tScale = 1
            let tOpacity = 1
            
            if (localTime < entryDuration) {
              const progress = Math.max(0, localTime / (entryDuration || 0.1))
              tOpacity = progress
              tScale = 0.8 + 0.2 * progress
            } else if (localTime > duration - exitDuration) {
              const progress = Math.max(0, (duration - localTime) / (exitDuration || 0.1))
              tOpacity = progress
              tScale = 0.8 + 0.2 * progress
            }
            
            layerTransitionStyle = {
              opacity: tOpacity,
              transform: `scale(${tScale})`,
            }
          }

          return (
            <div
              key={layer.id}
              className="layer-base"
              data-gizmo-target={isActive ? "active" : undefined}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                opacity: layer.opacityMode === 'fixed' ? transform.opacity : 1,
                ...layerTransitionStyle,
                width: 200, height: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: isActive ? 10 : 1
              }}
            >
              <div
                ref={(el) => {
                  if (el) layerRefsMap.current.set(layer.id, el)
                  else layerRefsMap.current.delete(layer.id)
                }}
                className="gen-layer-container"
                style={{ width: '100%', height: '100%' }}
              >
                {type === 'raw' && svgString ? (
                  <div
                    style={{ width: '100%', height: '100%' }}
                    dangerouslySetInnerHTML={{ __html: svgString }}
                  />
                ) : (
                  <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" overflow="visible">
                    {renderGenerativeShape(layer, shapeColor)}
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
