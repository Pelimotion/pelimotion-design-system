import React from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { Image as ImageIcon, Trash2, Upload, Move, Maximize } from 'lucide-react'

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-elevated)', border: '1px solid var(--color-surface-border)',
  borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)',
  padding: '6px 8px', fontSize: '0.8rem', outline: 'none', width: '100%', cursor: 'pointer',
}

const sliderStyle: React.CSSProperties = {
  width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer',
}

export function BackgroundUploader() {
  const { exportConfig, updateExportConfig, exportState } = useEditorStore()
  const { backgroundImageUrl, backgroundType, aspectRatioMode, overlayScale, overlayX, overlayY } = exportConfig

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const url = URL.createObjectURL(file)
    
    updateExportConfig({
      backgroundImageUrl: url,
      backgroundType: isVideo ? 'video' : 'image',
    })
    
    e.target.value = ''
  }

  const handleRemove = () => {
    if (backgroundImageUrl) {
      URL.revokeObjectURL(backgroundImageUrl)
    }
    updateExportConfig({
      backgroundImageUrl: undefined,
      backgroundType: undefined,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      
      {!backgroundImageUrl ? (
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '16px', border: '1px dashed var(--color-surface-border)',
          borderRadius: 'var(--radius-sm)', cursor: exportState.isExporting ? 'not-allowed' : 'pointer',
          color: 'var(--color-text-secondary)', fontSize: '0.75rem',
          background: 'var(--color-surface-glass)', transition: 'all 0.2s', opacity: exportState.isExporting ? 0.5 : 1
        }}>
          <Upload size={16} />
          <span>Upload Background (Imagem ou MP4)</span>
          <input 
            type="file" 
            accept="image/*,video/mp4" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
            disabled={exportState.isExporting}
          />
        </label>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--color-surface-glass)', padding: '6px 10px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
              <ImageIcon size={14} color="var(--color-accent)" />
              <span style={{ fontSize: '0.75rem' }}>Background Adicionado ({backgroundType})</span>
            </div>
            <button onClick={handleRemove} disabled={exportState.isExporting} style={{
              background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: exportState.isExporting ? 'not-allowed' : 'pointer', padding: 4
            }}>
              <Trash2 size={14} />
            </button>
          </div>
          
          {backgroundType === 'image' && (
            <img src={backgroundImageUrl} alt="Background Preview" style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          )}
          {backgroundType === 'video' && (
            <video src={backgroundImageUrl} style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Aspect Ratio Mode</span>
        <select 
          value={aspectRatioMode} 
          onChange={e => updateExportConfig({ aspectRatioMode: e.target.value as any })} 
          style={selectStyle}
          disabled={exportState.isExporting}
        >
          <option value="fit">Fit (Encaixar na resolução final)</option>
          <option value="crop">Crop (Preencher resolução final cortando)</option>
          <option value="manual">Manual (Escalar e Posicionar manualmente)</option>
        </select>
      </div>

      {aspectRatioMode === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--color-surface-glass)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Maximize size={12}/> Escala</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{overlayScale.toFixed(2)}x</span>
            </div>
            <input type="range" min={0.1} max={3.0} step={0.05} value={overlayScale} onChange={e => updateExportConfig({ overlayScale: parseFloat(e.target.value) })} style={sliderStyle} disabled={exportState.isExporting} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Move size={12}/> Posição X</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{overlayX}px</span>
            </div>
            <input type="range" min={-1920} max={1920} step={10} value={overlayX} onChange={e => updateExportConfig({ overlayX: parseInt(e.target.value) })} style={sliderStyle} disabled={exportState.isExporting} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Move size={12}/> Posição Y</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{overlayY}px</span>
            </div>
            <input type="range" min={-1080} max={1080} step={10} value={overlayY} onChange={e => updateExportConfig({ overlayY: parseInt(e.target.value) })} style={sliderStyle} disabled={exportState.isExporting} />
          </div>
        </div>
      )}

    </div>
  )
}
