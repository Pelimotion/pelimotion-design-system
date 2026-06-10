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
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { createNoiseDriver, type NoiseDriver } from '../Generative/noiseEngine'
import { renderGenerativeShape } from './shapes'
import type { GenerativeLayer } from '@/types/motion.types'

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
  const palette = colors && colors.length > 0 ? colors.filter(Boolean) : ['#a78bfa']

  // Select ALL svg descendant elements for this layer
  const allEls = Array.from(container.querySelectorAll('svg *')) as SVGElement[]

  // CRITICAL: Always reset inline styles first to prevent ghost colors
  allEls.forEach(el => {
    el.style.fill = ''
    el.style.stroke = ''
    el.style.opacity = ''
  })

  if (colorMode === 'original') {
    // Restore SVG's own attributes — nothing to do after reset
    return
  }

  // Gather only paintable elements (those with fill or stroke)
  const paintableEls = Array.from(container.querySelectorAll(
    'svg path, svg rect, svg circle, svg polygon, svg ellipse, svg line, svg polyline, svg text'
  )) as SVGElement[]

  if (colorMode === 'solid') {
    const solidColor = palette[0] || '#a78bfa'
    paintableEls.forEach(el => {
      // Override both attribute and inline style for maximum specificity
      el.setAttribute('fill', solidColor)
      el.style.fill = solidColor
      el.removeAttribute('stroke')
      el.style.stroke = 'none'
    })
  } else {
    // Duotone (2) or Tritone (3)
    let colorIndex = 0
    paintableEls.forEach(el => {
      const color = palette[colorIndex % palette.length] || '#a78bfa'
      el.setAttribute('fill', color)
      el.style.fill = color
      el.style.stroke = 'none'
      colorIndex++
    })
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function GenerativePreview() {
  const { motionConfig, generativeLayers } = useEditorStore()
  const {
    amplitude, frequency, octaves, persistence, noiseType, seed,
    propertyFps, propertyAmplitudes, propertyFrequencies, previewGrid
  } = motionConfig.wiggle

  // Map<layerId, { driver, container }>
  const driversRef = useRef<Map<string, NoiseDriver>>(new Map())
  // Refs for each layer's container div
  const layerRefsMap = useRef<Map<string, HTMLDivElement>>(new Map())
  const [isPlaying, setIsPlaying] = useState(true)

  // ── Per-Layer Engine Boot ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    // Stop & clear all previous drivers
    driversRef.current.forEach(d => d.stop())
    driversRef.current.clear()

    generativeLayers.forEach((layer, i) => {
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
      const layerSeed = seed + i * 137 // unique seed per layer

      // Main driver (for motion)
      const motionTargets = groupTargets.length > 0 ? groupTargets : pathTargets
      if (motionTargets.length > 0) {
        const driver = createNoiseDriver(motionTargets, {
          amplitude, frequency, octaves, persistence, noiseType,
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
          frequency, octaves, persistence, noiseType,
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

  return (
    <div style={{
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

      {/* Play / Pause */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          padding: '6px 18px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
          border: '1px solid var(--color-surface-border)', background: 'var(--color-surface-glass)',
          color: isPlaying ? 'var(--color-accent)' : 'var(--color-text-muted)',
          cursor: 'pointer', backdropFilter: 'blur(8px)', letterSpacing: '0.05em',
          textTransform: 'uppercase', zIndex: 100,
        }}
      >
        {isPlaying ? '⏸ Pausar' : '▶ Animar'}
      </button>

      {/* Layers Container (Free Canvas) */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {generativeLayers.map((layer) => {
          const { transform, type, svgString } = layer
          // For built-in shapes, use first layer color for initial render; noise colors applied via applyLayerColors
          const shapeColor = (layer.colors && layer.colors[0]) || '#a78bfa'

          return (
            <div
              key={layer.id}
              className="layer-base"
              style={{
                position: 'absolute',
                transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg) scale(${transform.scale})`,
                opacity: layer.opacityMode === 'fixed' ? transform.opacity : 1,
                width: 200, height: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
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
  )
}
