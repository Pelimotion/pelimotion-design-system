import React, { useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Download, CheckCircle2, MonitorPlay, Zap } from 'lucide-react'

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

const bentoCardStyle: React.CSSProperties = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-surface-border)',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
      } catch (e) {
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
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <MonitorPlay size={18} color="var(--color-accent)" />
          Render & Export
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Deliver your composition in broadcast-ready quality.
        </p>
        {(exportConfig.format === 'mp4' || exportConfig.format === 'mov') && (
          <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 4, background: exportState.exportMode === 'webcodecs-hw' ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 165, 0, 0.1)', border: `1px solid ${exportState.exportMode === 'webcodecs-hw' ? 'rgba(0, 255, 128, 0.3)' : 'rgba(255, 165, 0, 0.3)'}`, color: exportState.exportMode === 'webcodecs-hw' ? '#00ff80' : '#ffa500', fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}>
            {exportState.exportMode === 'webcodecs-hw' ? '⚡ Hardware Accelerated' : '🔄 Software Fallback'}
          </div>
        )}
      </div>

      <div style={bentoCardStyle}>
        <Campo label="Output Format" icon={<Download size={10} />}>
          <select 
            value={exportConfig.format} 
            onChange={e => updateExportConfig({ format: e.target.value as any })} 
            style={selectStyle}
            disabled={exportState.isExporting}
          >
            <option value="png-sequence">PNG Sequence (Native Alpha, ZIP)</option>
            <option value="png-still">Static PNG (1 Frame, Transparent/Bg)</option>
            <option value="mp4">MP4 Video (H.264, Requires Opaque Bg)</option>
            <option value="mov">MOV Video (VP9 w/ Alpha or Bg)</option>
          </select>
        </Campo>

        {exportConfig.format === 'png-still' && (
          <Campo label="Target Frame">
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <input type="range" min={0} max={exportConfig.duration * exportConfig.fps} step={1} value={exportConfig.stillFrame} onChange={e => updateExportConfig({ stillFrame: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--color-accent)' }} disabled={exportState.isExporting} />
               <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', minWidth: 40 }}>{exportConfig.stillFrame}f</span>
             </div>
          </Campo>
        )}
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
        onClick={handleExport}
        disabled={exportState.isExporting || exportState.stage === 'complete'}
        style={{
          marginTop: 'auto',
          padding: '16px',
          background: exportState.isExporting ? 'var(--color-surface-border)' : 'var(--color-accent)',
          color: exportState.isExporting ? 'var(--color-text-muted)' : '#000',
          border: 'none',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: 700,
          cursor: exportState.isExporting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: exportState.isExporting ? 'none' : '0 10px 25px -5px var(--color-accent)',
          opacity: exportState.isExporting || exportState.stage === 'complete' ? 0.7 : 1,
        }}
        onMouseOver={e => {
          if (!exportState.isExporting && exportState.stage !== 'complete') {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {exportState.isExporting ? (
          <>
            <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            Rendering... ({Math.round(exportState.progress)}%)
          </>
        ) : (
          <>
            <Zap size={18} fill="currentColor" />
            Start Render
          </>
        )}
      </button>

      <div style={{ padding: 16, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-surface-border)', borderRadius: '12px' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>Workflow Tip</span>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
          When using PNG Sequence in <strong>Premiere Pro</strong> or <strong>After Effects</strong>:<br/><br/>
          1. Extract the ZIP archive.<br/>
          2. Import and select only `frame_0000.png`.<br/>
          3. Check the <strong>"Image Sequence"</strong> box.<br/>
          4. It will import perfectly with native alpha channel.
        </p>
      </div>

    </div>
  )
}
