import React from 'react'
import { Settings, Frame, Activity } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { BackgroundUploader } from './BackgroundUploader'
import { CompositionTimeline } from './CompositionTimeline'

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-base)',
  border: '1px solid var(--color-surface-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  padding: '6px 8px',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  transition: 'border-color 0.2s ease',
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

const valueStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-mono)',
}

const bentoCardStyle: React.CSSProperties = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-surface-border)',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}

function Campo({ label, valor, children, icon }: { label: string; valor?: string | number; children: React.ReactNode, icon?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={labelStyle}>{icon} {label}</span>
        {valor !== undefined && <span style={valueStyle}>{valor}</span>}
      </div>
      {children}
    </div>
  )
}

export function CompositionPanel() {
  const { exportConfig, updateExportConfig } = useEditorStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflowY: 'auto', paddingRight: 4, paddingBottom: 32 }} className="custom-scrollbar">
      
      {/* SCENE SETTINGS BENTO */}
      <div style={bentoCardStyle}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
          <Settings size={14} color="var(--color-accent)" /> Global Scene Settings
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <Campo label="Resolution" icon={<Frame size={10} />}>
            <select 
              value={exportConfig.resolution} 
              onChange={e => updateExportConfig({ resolution: e.target.value as any })} 
              style={selectStyle}
            >
              <option value="1920x1080">1920×1080 (Horizontal / 16:9)</option>
              <option value="1080x1080">1080×1080 (Quadrado / 1:1)</option>
              <option value="1080x1920">1080×1920 (Vertical / 9:16)</option>
              <option value="1350x1080">1350×1080 (Vertical / 4:5)</option>
            </select>
          </Campo>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo label="Framerate" icon={<Activity size={10} />}>
              <select 
                value={exportConfig.fps} 
                onChange={e => updateExportConfig({ fps: parseInt(e.target.value) })} 
                style={selectStyle}
              >
                <option value="24">24 fps (Cinema)</option>
                <option value="30">30 fps (Web)</option>
                <option value="60">60 fps (Fluido)</option>
              </select>
            </Campo>
            <Campo label="Duration" valor={`${exportConfig.duration}s`}>
              <input 
                type="range" min={1} max={30} step={1} 
                value={exportConfig.duration}
                onChange={e => updateExportConfig({ duration: parseInt(e.target.value) })} 
                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
              />
            </Campo>
          </div>
        </div>
      </div>

      {/* BACKGROUND UPLOADER BENTO */}
      <div style={bentoCardStyle}>
        <BackgroundUploader />
      </div>

      {/* TIMELINE */}
      <CompositionTimeline />
    </div>
  )
}
