import React, { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Download, CheckCircle2, MonitorPlay, Zap, Settings2 } from 'lucide-react'
import type { ExportConfig } from '@/types/motion.types'

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-base)',
  border: '1px solid var(--color-surface-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  padding: '8px 10px',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  display: 'flex',
  alignItems: 'center',
  gap: 4
}



function Campo({ label, children, icon }: { label: string; children: React.ReactNode, icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={labelStyle}>{icon} {label}</span>
      {children}
    </div>
  )
}

export function ExportPanel() {
  const { exportConfig, updateExportConfig, exportState, setExportState, resetExport } = useEditorStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const handleExport = () => {
    setExportState({ isExporting: true, stage: 'idle', progress: 0, errorMessage: undefined })
  }

  useEffect(() => {
    async function detectSupport() {
      if (typeof VideoEncoder === 'undefined') {
        setExportState({ exportMode: 'ffmpeg-fallback' })
        return
      }
      
      const [wStr, hStr] = (exportConfig.resolution || "1920x1080").split('x')
      const width = parseInt(wStr || "1920", 10)
      const height = parseInt(hStr || "1080", 10)
      const safeWidth = width % 2 === 0 ? width : width - 1;
      const safeHeight = height % 2 === 0 ? height : height - 1;

      try {
        const result = await VideoEncoder.isConfigSupported({
          codec: 'avc1.4d0028',
          width: safeWidth,
          height: safeHeight,
        })
        setExportState({ exportMode: result.supported ? 'webcodecs-hw' : 'ffmpeg-fallback' })
      } catch {
        setExportState({ exportMode: 'ffmpeg-fallback' })
      }
    }
    detectSupport()
  }, [exportConfig.resolution, setExportState])

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflowY: 'auto', paddingRight: 4, paddingBottom: 32 }}
      className="custom-scrollbar"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <MonitorPlay size={17} color="var(--color-accent)" />
          Render & Export
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Exporte sua composição com qualidade profissional.
        </p>
        {(exportConfig.format === 'mp4' || exportConfig.format === 'mov') && (
          <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: exportState.exportMode === 'webcodecs-hw' ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 165, 0, 0.1)', border: `1px solid ${exportState.exportMode === 'webcodecs-hw' ? 'rgba(0, 255, 128, 0.3)' : 'rgba(255, 165, 0, 0.3)'}`, color: exportState.exportMode === 'webcodecs-hw' ? '#00ff80' : '#ffa500', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
            {exportState.exportMode === 'webcodecs-hw' ? '⚡ Acelerado por Hardware' : '🔄 Modo Software'}
          </div>
        )}
      </div>

      <div className="bento-card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '12px' }}>
        <Campo label="Formato de Saída" icon={<Download size={10} />}>
          <select 
            value={exportConfig.format} 
            onChange={e => updateExportConfig({ format: e.target.value as ExportConfig['format'] })} 
            style={selectStyle}
            disabled={exportState.isExporting}
          >
            <option value="png-sequence">Sequência PNG (Alpha Nativo, ZIP)</option>
            <option value="png-still">PNG Estático (1 Frame, Transparente/Bg)</option>
            <option value="mp4">Vídeo MP4 (H.264, Requer Fundo Opaco)</option>
            <option value="mov">Vídeo MOV (VP9 c/ Alpha ou Bg)</option>
          </select>
        </Campo>

        {exportConfig.format === 'png-still' && (
          <Campo label="Frame Alvo">
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <input type="range" min={0} max={exportConfig.duration * exportConfig.fps} step={1} value={exportConfig.stillFrame} onChange={e => updateExportConfig({ stillFrame: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--color-accent)' }} disabled={exportState.isExporting} />
               <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', minWidth: 40 }}>{exportConfig.stillFrame}f</span>
             </div>
          </Campo>
        )}

        {/* Resolução e FPS — controles principais de render */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Campo label="Resolução" icon={<Zap size={10} />}>
            <select value={exportConfig.resolution} onChange={e => updateExportConfig({ resolution: e.target.value as ExportConfig['resolution'] })} style={selectStyle} disabled={exportState.isExporting}>
              <option value="1920x1080">1080p (Full HD)</option>
              <option value="3840x2160">4K (Ultra HD)</option>
              <option value="1080x1920">Vertical (Stories)</option>
              <option value="1080x1080">Quadrado (Instagram)</option>
            </select>
          </Campo>

          <Campo label="Framerate">
            <select value={exportConfig.fps} onChange={e => updateExportConfig({ fps: parseInt(e.target.value) })} style={selectStyle} disabled={exportState.isExporting}>
              <option value={24}>24 FPS — Cinema</option>
              <option value={30}>30 FPS — Web</option>
              <option value={60}>60 FPS — Fluido</option>
            </select>
          </Campo>
        </div>

        {/* Opções Avançadas */}
        <div style={{ borderTop: '1px solid var(--color-surface-border)', paddingTop: 12, marginTop: 4 }}>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
          >
            <Settings2 size={12} style={{ transform: showAdvanced ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }} />
            {showAdvanced ? 'Ocultar Opções Avançadas' : 'Opções Avançadas'}
          </button>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            maxHeight: showAdvanced ? 120 : 0,
            opacity: showAdvanced ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            marginTop: showAdvanced ? 12 : 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                id="watermark-toggle"
                type="checkbox"
                checked={exportConfig.includeWatermark !== false}
                onChange={e => updateExportConfig({ includeWatermark: e.target.checked })}
                disabled={exportState.isExporting}
                style={{ width: 14, height: 14, accentColor: 'var(--color-accent)', cursor: 'pointer' }}
              />
              <label htmlFor="watermark-toggle" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                Incluir marca d’água Pelimotion
              </label>
            </div>
          </div>
        </div>
      </div>

      {exportState.stage === 'error' && (
        <div style={{ padding: 16, background: 'hsla(0,100%,50%,0.05)', border: '1px solid hsla(0,100%,50%,0.2)', borderRadius: '12px', color: 'var(--color-error)', fontSize: '0.8rem' }}>
          <strong>Error:</strong> {exportState.errorMessage}
          <button onClick={resetExport} style={{ marginTop: 12, padding: '6px 12px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Try Again</button>
        </div>
      )}

      {exportState.stage === 'complete' && (
        <div style={{ padding: 24, background: 'hsla(120,100%,50%,0.05)', border: '1px solid hsla(120,100%,50%,0.2)', borderRadius: '12px', color: 'var(--color-success)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
          <CheckCircle2 size={36} />
          <span><strong>Render Complete!</strong><br />Your file is ready and downloading.</span>
          <button onClick={resetExport} style={{ marginTop: 8, padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>New Render</button>
        </div>
      )}

      <button
        id="render-btn"
        onClick={exportState.isExporting || exportState.stage === 'complete' ? undefined : handleExport}
        disabled={exportState.isExporting || exportState.stage === 'complete'}
        className="btn-pressable"
        style={{
          marginTop: 'auto',
          padding: '16px',
          background: exportState.isExporting ? 'var(--color-surface-border)' : 'var(--color-accent)',
          color: exportState.isExporting ? 'var(--color-text-muted)' : '#000',
          border: 'none',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: 700,
          cursor: (exportState.isExporting || exportState.stage === 'complete') ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: exportState.isExporting ? 'none' : '0 10px 25px -5px var(--color-accent)',
          opacity: exportState.isExporting || exportState.stage === 'complete' ? 0.7 : 1,
          width: '100%',
        }}
      >
        {exportState.isExporting ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              Renderizando... ({Math.round(exportState.progress)}%)
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExportState({ isExporting: false, stage: 'idle', progress: 0 });
              }}
              style={{
                background: 'var(--color-error)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <Zap size={18} fill="currentColor" />
            Iniciar Render
          </>
        )}
      </button>

      <div className="bento-card-premium" style={{ padding: 16, borderRadius: '12px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>Dica de Workflow</span>
        <p style={{ fontSize: '0.73rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Usando <strong>PNG Sequence</strong> no <strong>Premiere Pro</strong> ou <strong>After Effects</strong>:<br/><br/>
          1. Extraia o arquivo ZIP.<br/>
          2. Importe e selecione apenas <code>frame_0000.png</code>.<br/>
          3. Marque a caixa <strong>"Image Sequence"</strong>.<br/>
          4. O canal alpha nativo será preservado.
        </p>
      </div>

    </div>
  )
}
