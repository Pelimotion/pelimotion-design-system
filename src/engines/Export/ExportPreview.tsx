/**
 * Export Preview — Phase 5 (Updated with Composition)
 * 
 * Provides a dedicated container for the export pipeline.
 * Renders the Background and the Foreground (Typography/Generative)
 * applying the selected aspect ratio and transformations.
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

  const { backgroundImageUrl, backgroundType, aspectRatioMode, overlayScale, overlayX, overlayY } = exportConfig

  // Calculate foreground container style based on Aspect Ratio mode
  let fgStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }

  if (aspectRatioMode === 'manual') {
    fgStyle = {
      ...fgStyle,
      transform: `translate(${overlayX}px, ${overlayY}px) scale(${overlayScale})`,
    }
  } else if (aspectRatioMode === 'fit') {
    fgStyle = {
      ...fgStyle,
      objectFit: 'contain',
    }
  } else if (aspectRatioMode === 'crop') {
    fgStyle = {
      ...fgStyle,
      objectFit: 'cover',
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden',
    }}>
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
            background: backgroundImageUrl ? 'transparent' : 'var(--color-bg-primary)',
            transform: `scale(min(1, min(100% / ${width}, 100% / ${height})))`,
            transformOrigin: 'center center',
            overflow: 'hidden',
          }}
        >
          {/* Background Layer */}
          {backgroundImageUrl && backgroundType === 'image' && (
            <img 
              src={backgroundImageUrl} 
              alt="bg" 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
            />
          )}
          
          {backgroundImageUrl && backgroundType === 'video' && (
            <video 
              id="export-bg-video"
              src={backgroundImageUrl} 
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
            />
          )}

          {/* Foreground Layer (Typography for now, can be dynamically switched to GenerativePreview) */}
          <div style={fgStyle}>
            <TypographyPreview />
          </div>
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
            {exportState.stage === 'capturing' ? 'Capturando Frames...' : 'Codificando...'}
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
              : 'Processando...'
            }
          </div>
        </div>
      )}
    </div>
  )
}
