/**
 * GenerativePreview — Phase 4 (Infinite Canvas & Dynamic Shapes)
 *
 * Canvas component for the Generative engine.
 * Handles SVG injection, parameterized shapes, layer transforms, noise-driven animation,
 * and aspect ratio preview grids.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { createNoiseDriver, type NoiseDriver } from '../Generative/noiseEngine'
import { renderGenerativeShape } from './shapes'

function AspectRatioGrid({ ratio, label, color = 'rgba(255,255,255,0.2)' }: { ratio: number, label: string, color?: string }) {
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

export function GenerativePreview() {
  const { motionConfig, generativeLayers } = useEditorStore()
  const { 
    amplitude, frequency, octaves, persistence, noiseType, seed, 
    propertyFps, propertyAmplitudes, propertyFrequencies,
    targetMode, colorMode, colors, previewGrid 
  } = motionConfig.wiggle

  const containerRef = useRef<HTMLDivElement>(null)
  const driverRef = useRef<NoiseDriver | null>(null)

  const [isPlaying, setIsPlaying] = useState(true)

  // ── Load SVG + apply colors + boot noise driver ────────────────────────────
  useLayoutEffect(() => {
    if (!containerRef.current || generativeLayers.length === 0) return

    driverRef.current?.stop()
    driverRef.current = null

    // 1. Colorization Logic (applied to 'raw' SVGs injected via dangerouslySetInnerHTML)
    const colorPalette: string[] = (colors && colors.length > 0) ? (colors as string[]).filter(Boolean) : ['var(--color-accent)'];
    
    if (colorMode === 'solid') {
      const paths = containerRef.current.querySelectorAll('.raw-svg-container svg *');
      const solidColor = colorPalette[0] || 'var(--color-accent)';
      paths.forEach(el => {
        if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') el.setAttribute('fill', solidColor);
        if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') el.setAttribute('stroke', solidColor);
      });
    } else {
      // Duotone / Tritone
      const paths = containerRef.current.querySelectorAll('.raw-svg-container path, .raw-svg-container rect, .raw-svg-container circle, .raw-svg-container polygon, .raw-svg-container ellipse, .raw-svg-container line, .raw-svg-container polyline');
      let colorIndex = 0;
      paths.forEach(el => {
        const hasFill = el.hasAttribute('fill') && el.getAttribute('fill') !== 'none';
        const hasStroke = el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none';
        
        const currentColor = colorPalette[colorIndex % colorPalette.length] || 'var(--color-accent)';

        // Default to fill if neither is specified
        if (hasFill || (!hasFill && !hasStroke)) {
          el.setAttribute('fill', currentColor);
        }
        if (hasStroke) {
          el.setAttribute('stroke', currentColor);
        }
        colorIndex++;
      });
    }

    // 2. Target Selection Logic
    // If targetMode is 'group', animate `.noise-target` directly (the whole SVG element wrapper).
    // If targetMode is 'layers', animate `.noise-target > svg > *`.
    const targets = targetMode === 'group' 
      ? Array.from(containerRef.current.querySelectorAll('.noise-target'))
      : Array.from(containerRef.current.querySelectorAll('.noise-target > svg > *'));

    if (targets.length === 0) return

    const driver = createNoiseDriver(targets, {
      amplitude,
      frequency,
      octaves,
      persistence,
      noiseType,
      seed,
      channels: ['x', 'y', 'rotation', 'scale', 'scaleX', 'scaleY', 'skew', 'opacity'],
      propertyFps: propertyFps || {},
      propertyAmplitudes: propertyAmplitudes || {},
      propertyFrequencies: propertyFrequencies || {},
      targetMode,
      colorMode,
      colors: colorPalette,
      previewGrid: previewGrid || 'none',
    })

    driverRef.current = driver

    if (isPlaying) driver.start()

    return () => {
      driverRef.current?.stop()
      driverRef.current = null
    }
  }, [generativeLayers, amplitude, frequency, octaves, persistence, noiseType, seed, propertyFps, propertyAmplitudes, propertyFrequencies, targetMode, colorMode, colors, isPlaying])

  // ── Play / pause without full reload ─────────────────────────────────────
  useEffect(() => {
    if (!driverRef.current) return
    if (isPlaying) driverRef.current.startHeadless()
    else driverRef.current.stop()
  }, [isPlaying])

  const colorPalette: string[] = (colors && colors.length > 0) ? (colors as string[]).filter(Boolean) : ['var(--color-accent)'];

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden' // Infinite canvas bounds
    }}>
      
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
          padding: '6px 18px',
          borderRadius: 99,
          fontSize: '0.72rem',
          fontWeight: 700,
          border: '1px solid var(--color-surface-border)',
          background: 'var(--color-surface-glass)',
          color: isPlaying ? 'var(--color-accent)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          zIndex: 100,
        }}
      >
        {isPlaying ? '⏸ Pausar' : '▶ Animar'}
      </button>

      {/* Layers Container (Free Canvas) */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {generativeLayers.map((layer, i) => {
          const { transform, type, svgString } = layer;
          const layerColor = colorPalette[i % colorPalette.length] || 'var(--color-accent)';
          
          return (
            <div
              key={layer.id}
              className="layer-base"
              style={{
                position: 'absolute',
                // Base transform from UI panel
                transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg) scale(${transform.scale})`,
                opacity: transform.opacity,
                width: 200, height: 200, // Default sizing for generative shapes
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {/* Noise target wrapper */}
              <div className="noise-target" style={{ width: '100%', height: '100%' }}>
                {type === 'raw' && svgString ? (
                  <div
                    className="raw-svg-container"
                    style={{ width: '100%', height: '100%' }}
                    dangerouslySetInnerHTML={{ __html: svgString }}
                  />
                ) : (
                  <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    {renderGenerativeShape(layer, layerColor)}
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

