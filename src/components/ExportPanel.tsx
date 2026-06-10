/**
 * ExportPanel — Phase 5
 * 
 * Sidebar UI for configuring and triggering the export pipeline.
 */
import React from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Download, CheckCircle2 } from 'lucide-react'
import { BackgroundUploader } from './BackgroundUploader'

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-surface-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  padding: '6px 8px',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
}

const valueStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-mono)',
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

function Campo({ label, valor, children }: { label: string; valor?: string | number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={labelStyle}>{label}</span>
        {valor !== undefined && <span style={valueStyle}>{valor}</span>}
      </div>
      {children}
    </div>
  )
}

export function ExportPanel() {
  const { exportConfig, updateExportConfig, exportState, setExportState, resetExport } = useEditorStore()
  
  const handleExport = () => {
    // Triggers the useEffect in ExportPreview
    setExportState({ isExporting: true, stage: 'idle', progress: 0, errorMessage: undefined })
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%', overflowY: 'auto', paddingRight: 4 }}
      className="custom-scrollbar"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={16} color="var(--color-accent)" />
          Exportar Mídia
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Renderize sua animação para uso em editores de vídeo (Premiere, Resolve, After Effects).
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Campo label="Resolução">
          <select 
            value={exportConfig.resolution} 
            onChange={e => updateExportConfig({ resolution: e.target.value as any })} 
            style={selectStyle}
            disabled={exportState.isExporting}
          >
            <option value="1920x1080">1920×1080 (Horizontal / 16:9)</option>
            <option value="1080x1080">1080×1080 (Quadrado / 1:1)</option>
            <option value="1080x1920">1080×1920 (Vertical / 9:16)</option>
            <option value="1350x1080">1350×1080 (Vertical / 4:5)</option>
          </select>
        </Campo>

        <Row2>
          <Campo label="Framerate (FPS)">
            <select 
              value={exportConfig.fps} 
              onChange={e => updateExportConfig({ fps: parseInt(e.target.value) })} 
              style={selectStyle}
              disabled={exportState.isExporting}
            >
              <option value="24">24 fps (Cinema)</option>
              <option value="30">30 fps (Web)</option>
              <option value="60">60 fps (Fluido)</option>
            </select>
          </Campo>
          <Campo label="Duração" valor={`${exportConfig.duration}s`}>
            <input 
              type="range" min={1} max={10} step={1} 
              value={exportConfig.duration}
              onChange={e => updateExportConfig({ duration: parseInt(e.target.value) })} 
              style={{ width: '100%', accentColor: 'var(--color-accent)' }}
              disabled={exportState.isExporting}
            />
          </Campo>
        </Row2>

        <Campo label="Formato de Saída">
          <select 
            value={exportConfig.format} 
            onChange={e => updateExportConfig({ format: e.target.value as any })} 
            style={selectStyle}
            disabled={exportState.isExporting}
          >
            <option value="png-sequence">Sequência PNG (Alpha nativo, ZIP)</option>
            <option value="png-still">PNG Estático (1 Frame, Fundo Transparente/Bg)</option>
            <option value="mp4">Vídeo MP4 (H.264, requer Background opaco)</option>
            <option value="mov">Vídeo MOV (VP9 com Alpha ou Background)</option>
          </select>
        </Campo>

        {exportConfig.format === 'png-still' && (
          <Campo label="Frame a exportar" valor={exportConfig.stillFrame}>
             <input type="range" min={0} max={exportConfig.duration * exportConfig.fps} step={1} value={exportConfig.stillFrame} onChange={e => updateExportConfig({ stillFrame: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--color-accent)' }} disabled={exportState.isExporting} />
          </Campo>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />
        
        <BackgroundUploader />
        
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />
      </div>

      {exportState.stage === 'error' && (
        <div style={{ padding: 12, background: 'hsla(0,100%,50%,0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', color: 'var(--color-error)', fontSize: '0.8rem' }}>
          <strong>Erro na exportação:</strong> {exportState.errorMessage}
          <button onClick={resetExport} style={{ marginTop: 8, padding: '4px 8px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.7rem' }}>Tentar Novamente</button>
        </div>
      )}

      {exportState.stage === 'complete' && (
        <div style={{ padding: 12, background: 'hsla(120,100%,50%,0.1)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', color: 'var(--color-success)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
          <CheckCircle2 size={32} />
          <span><strong>Exportação concluída!</strong><br />O arquivo ZIP deve começar a baixar automaticamente.</span>
          <button onClick={resetExport} style={{ marginTop: 4, padding: '6px 12px', background: 'transparent', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: 4, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>Nova Exportação</button>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={exportState.isExporting || exportState.stage === 'complete'}
        style={{
          marginTop: 'auto',
          padding: '12px 16px',
          background: exportState.isExporting ? 'var(--color-surface-border)' : 'var(--color-accent)',
          color: exportState.isExporting ? 'var(--color-text-muted)' : '#0a0a0f',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: exportState.isExporting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.2s',
        }}
      >
        {exportState.isExporting ? (
          <>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            Renderizando...
          </>
        ) : (
          <>
            <Download size={16} />
            Iniciar Render
          </>
        )}
      </button>

      <div style={{ padding: 12, background: 'var(--color-surface-glass)', border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 4 }}>Dica de Workflow</span>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
          Para usar a Sequência PNG no <strong>Premiere Pro</strong> ou <strong>After Effects</strong>:<br/>
          1. Extraia o arquivo ZIP gerado.<br/>
          2. Na janela de importação, selecione apenas o primeiro arquivo (`frame_0000.png`).<br/>
          3. Marque a caixa <strong>"Image Sequence" (Sequência de Imagens)</strong>.<br/>
          4. O software importará todos os frames como um vídeo único com fundo perfeitamente transparente.
        </p>
      </div>

    </div>
  )
}
