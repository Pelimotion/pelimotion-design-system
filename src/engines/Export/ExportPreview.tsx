/**
 * Export Preview — Phase 5
 * 
 * Provides a dedicated container for the export pipeline.
 * We render the Typography Preview here at the precise target resolution
 * scaled down via CSS to fit the screen. This ensures the captured PNGs
 * are exactly the required dimensions (e.g. 1920x1080).
 */
import { useRef, useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { TypographyPreview } from '@/engines/Typography'
import { runExportPipeline } from './exportPipeline'

export function ExportPreview() {
  const { exportConfig, exportState, setExportState } = useEditorStore()
  const captureRef = useRef<HTMLDivElement>(null)

  const [wStr, hStr] = (exportConfig.resolution || "1920x1080").split('x') as [string, string]
  const width = parseInt(wStr, 10)
  const height = parseInt(hStr, 10)

  // Listen for export trigger
  useEffect(() => {
    if (exportState.stage === 'idle' && exportState.isExporting && captureRef.current) {
      runExportPipeline(captureRef.current, exportConfig, setExportState)
    }
  }, [exportState.isExporting, exportState.stage, exportConfig, setExportState])

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden',
    }}>
      {/* 
        The Capture Container
        It is strictly sized to the target resolution, but scaled down
        visually using CSS transform so it fits the editor window.
        html-to-image ignores the CSS scale and captures the true width/height.
      */}
      <div style={{
        position: 'relative',
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div
          ref={captureRef}
          style={{
            width, height,
            position: 'absolute',
            background: 'var(--color-bg-primary)',
            // For preview, we scale it down to fit the container
            transform: `scale(min(1, min(100% / ${width}, 100% / ${height})))`,
            transformOrigin: 'center center',
            overflow: 'hidden',
          }}
        >
          {/* For now, we only export the Typography engine.
              Generative export can be wired similarly by switching components. */}
          <TypographyPreview />
        </div>
      </div>

      {/* Export Overlay */}
      {exportState.isExporting && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'hsla(0,0%,0%,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', gap: 16,
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            {exportState.stage === 'capturing' ? 'Capturando Frames...' : 'Codificando ZIP...'}
          </div>
          
          <div style={{ width: 300, height: 6, background: 'var(--color-surface-glass)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--color-accent)',
              width: `${exportState.progress}%`, transition: 'width 0.1s'
            }} />
          </div>

          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
            {exportState.stage === 'capturing' 
              ? `${exportState.currentFrame} / ${exportState.totalFrames} frames`
              : 'Compactando PNGs...'
            }
          </div>
        </div>
      )}
    </div>
  )
}
