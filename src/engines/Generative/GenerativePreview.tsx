/**
 * GenerativePreview — Phase 3 (Updated)
 *
 * Canvas component for the Generative SVG engine.
 * Handles SVG injection, noise-driven animation, and property-based posterize.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { createNoiseDriver, type NoiseDriver } from '../Generative/noiseEngine'

export function GenerativePreview() {
  const { motionConfig, generativeLayers, addGenerativeLayer } = useEditorStore()
  const { amplitude, frequency, octaves, persistence, noiseType, seed, propertyFps } = motionConfig.wiggle

  const containerRef = useRef<HTMLDivElement>(null)
  const driverRef = useRef<NoiseDriver | null>(null)

  const [isPlaying, setIsPlaying] = useState(true)

  // Demo asset if empty
  useEffect(() => {
    if (generativeLayers.length === 0) {
      // Just inject a default circle as raw SVG
      addGenerativeLayer(`<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="var(--color-accent)" /></svg>`)
    }
  }, [generativeLayers.length, addGenerativeLayer])

  // ── Load SVG + boot noise driver ──────────────────────────────────────────
  useLayoutEffect(() => {
    if (!containerRef.current || generativeLayers.length === 0) return

    driverRef.current?.stop()
    driverRef.current = null

    // Find all valid animatable elements inside the container
    const targets = Array.from(containerRef.current.querySelectorAll('svg > *'))

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
    })

    driverRef.current = driver

    if (isPlaying) driver.start()

    return () => {
      driverRef.current?.stop()
      driverRef.current = null
    }
  }, [generativeLayers, amplitude, frequency, octaves, persistence, noiseType, seed, propertyFps])

  // ── Play / pause without full reload ─────────────────────────────────────
  useEffect(() => {
    if (!driverRef.current) return
    if (isPlaying) driverRef.current.start()
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
          width: '60%',
          maxWidth: 420,
          aspectRatio: '1 / 1',
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
            dangerouslySetInnerHTML={{ __html: svgStr.replace(/fill="[^"]*"/g, 'fill="var(--color-accent)"') }}
          />
        ))}
      </div>
    </div>
  )
}
