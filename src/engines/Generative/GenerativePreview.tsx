/**
 * GenerativePreview — Phase 3
 *
 * Canvas component for the Generative SVG engine.
 * Handles SVG injection, noise-driven animation, and posterize integration.
 * All state is driven by the Zustand store (WiggleConfig + PosterizeConfig).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { SVG_CATALOG, loadSVG } from '../Generative/svgInjector'
import { createNoiseDriver } from '../Generative/noiseEngine'
import { startPosterize, stopPosterize, registerGatedCallback } from '../Generative/posterizeTime'
import type { SVGAsset } from '../Generative/svgInjector'
import type { NoiseDriver } from '../Generative/noiseEngine'
import type { NoiseChannel } from '../Generative/noiseEngine'

const DEFAULT_ASSET = SVG_CATALOG[0] as SVGAsset
const DEFAULT_CHANNELS: NoiseChannel[] = ['x', 'y', 'rotation']

export function GenerativePreview() {
  const { motionConfig, posterizeEnabled, posterizeFps } = useEditorStore()
  const { amplitude, frequency, octaves, persistence, noiseType, seed } = motionConfig.wiggle

  const svgContainerRef = useRef<HTMLDivElement>(null)
  const driverRef = useRef<NoiseDriver | null>(null)
  const gatedCleanupRef = useRef<(() => void) | null>(null)

  const [activeAsset, setActiveAsset] = useState<SVGAsset>(DEFAULT_ASSET)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  // ── Posterize sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (posterizeEnabled) {
      startPosterize(posterizeFps)
    } else {
      stopPosterize()
    }
  }, [posterizeEnabled, posterizeFps])

  // ── Load SVG + boot noise driver ──────────────────────────────────────────
  useLayoutEffect(() => {
    if (!svgContainerRef.current) return

    // Teardown previous driver
    driverRef.current?.stop()
    driverRef.current = null
    gatedCleanupRef.current?.()
    gatedCleanupRef.current = null

    setLoading(true)
    setError(null)

    let cancelled = false

    loadSVG(activeAsset, svgContainerRef.current, 'var(--color-accent)')
      .then(({ targets }) => {
        if (cancelled || !targets.length) return

        const driver = createNoiseDriver(targets, {
          amplitude,
          frequency,
          octaves,
          persistence,
          noiseType,
          seed,
          channels: DEFAULT_CHANNELS,
        })

        driverRef.current = driver

        // Route driver through gated callbacks so posterize works.
        // We use startHeadless so the driver does NOT also register on gsap.ticker —
        // the gated callback is the only dispatcher, avoiding double-fire.
        const cleanup = registerGatedCallback((time) => {
          if (!driverRef.current) return
          driverRef.current.tick(time)
        })
        gatedCleanupRef.current = cleanup

        if (isPlaying) driver.startHeadless()
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || 'Erro ao carregar SVG')
        setLoading(false)
      })

    return () => {
      cancelled = true
      driverRef.current?.stop()
      driverRef.current = null
      gatedCleanupRef.current?.()
      gatedCleanupRef.current = null
    }
  }, [activeAsset, amplitude, frequency, octaves, persistence, noiseType, seed])

  // ── Play / pause without full reload ─────────────────────────────────────
  useEffect(() => {
    if (!driverRef.current) return
    // When pausing, call stop() to freeze the driver.
    // When resuming, use startHeadless() — gated callback already handles dispatch.
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

      {/* Asset selector strip */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, zIndex: 10,
      }}>
        {SVG_CATALOG.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setActiveAsset(asset)}
            title={asset.description}
            style={{
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: '0.72rem',
              fontWeight: 600,
              border: `1px solid ${activeAsset.id === asset.id ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
              background: activeAsset.id === asset.id ? 'var(--color-accent-muted)' : 'var(--color-surface-glass)',
              color: activeAsset.id === asset.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)',
            }}
          >
            {asset.label}
          </button>
        ))}
      </div>

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

      {/* SVG Canvas */}
      <div
        ref={svgContainerRef}
        style={{
          width: '60%',
          maxWidth: 420,
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      />

      {/* Loading / Error states */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)', fontSize: '0.8rem',
        }}>
          Carregando SVG...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-error)', fontSize: '0.8rem',
        }}>
          {error}
        </div>
      )}

      {/* Posterize indicator */}
      {posterizeEnabled && (
        <div style={{
          position: 'absolute', top: 20, right: 20,
          padding: '4px 10px',
          borderRadius: 99,
          fontSize: '0.65rem',
          fontWeight: 700,
          background: 'hsla(40, 100%, 50%, 0.12)',
          border: '1px solid hsla(40, 100%, 50%, 0.25)',
          color: 'var(--color-warning)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}>
          POSTERIZE {posterizeFps}fps
        </div>
      )}
    </div>
  )
}
