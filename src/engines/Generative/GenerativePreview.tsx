/**
 * GenerativePreview — Phase 3 (Updated)
 *
 * Canvas component for the Generative SVG engine.
 * Handles SVG injection, noise-driven animation, property-based posterize,
 * target modes, and colorization logic.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { createNoiseDriver, type NoiseDriver } from '../Generative/noiseEngine'

export function GenerativePreview() {
  const { motionConfig, generativeLayers, addGenerativeLayer } = useEditorStore()
  const { 
    amplitude, frequency, octaves, persistence, noiseType, seed, 
    propertyFps, propertyAmplitudes, propertyFrequencies,
    targetMode, colorMode, colors 
  } = motionConfig.wiggle

  const containerRef = useRef<HTMLDivElement>(null)
  const driverRef = useRef<NoiseDriver | null>(null)

  const [isPlaying, setIsPlaying] = useState(true)

  // Demo asset if empty
  useEffect(() => {
    if (generativeLayers.length === 0) {
      // Just inject a default circle as raw SVG
      addGenerativeLayer(`<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="var(--color-accent)" /></svg>`)
    }
  }, [generativeLayers.length, addGenerativeLayer])

  // ── Load SVG + apply colors + boot noise driver ────────────────────────────
  useLayoutEffect(() => {
    if (!containerRef.current || generativeLayers.length === 0) return

    driverRef.current?.stop()
    driverRef.current = null

    // 1. Colorization Logic
    const colorPalette: string[] = (colors && colors.length > 0) ? (colors as string[]).filter(Boolean) : ['var(--color-accent)'];
    
    if (colorMode === 'solid') {
      const paths = containerRef.current.querySelectorAll('svg *');
      const solidColor = colorPalette[0] || 'var(--color-accent)';
      paths.forEach(el => {
        if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') el.setAttribute('fill', solidColor);
        if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') el.setAttribute('stroke', solidColor);
      });
    } else {
      // Duotone / Tritone
      const paths = containerRef.current.querySelectorAll('path, rect, circle, polygon, ellipse, line, polyline');
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
    // If targetMode is 'group', we animate the entire SVG tags.
    // If targetMode is 'layers', we animate the immediate children of the SVGs.
    const targets = targetMode === 'group' 
      ? Array.from(containerRef.current.querySelectorAll('svg'))
      : Array.from(containerRef.current.querySelectorAll('svg > *'));

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

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
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
          zIndex: 10,
        }}
      >
        {isPlaying ? '⏸ Pausar' : '▶ Animar'}
      </button>

      {/* Layers Container */}
      <div
        ref={containerRef}
        style={{
          width: '80%', // Make it responsive
          height: '80%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {generativeLayers.map((svgStr, i) => (
          <div
            key={i}
            style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: svgStr }}
          />
        ))}
      </div>
    </div>
  )
}
