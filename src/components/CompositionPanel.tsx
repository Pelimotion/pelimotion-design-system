import React from 'react'
import { Settings, Frame, Activity, Clock, Film } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { BackgroundUploader } from './BackgroundUploader'

function formatTime(seconds: number): string {
  const m  = Math.floor(seconds / 60);
  const s  = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-base)',
  border: '1px solid var(--color-surface-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  padding: '7px 10px',
  fontSize: '0.82rem',
  outline: 'none',
  width: '100%',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: 32,
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}

const valueStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-mono)',
}

function Campo({
  label,
  valor,
  children,
  icon,
}: {
  label: string
  valor?: string | number
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={labelStyle}>
          {icon} {label}
        </span>
        {valor !== undefined && <span style={valueStyle}>{valor}</span>}
      </div>
      {children}
    </div>
  )
}

export function CompositionPanel() {
  const { exportConfig, updateExportConfig, currentTime, compositionLayers, setActivePanel } =
    useEditorStore()

  const hasLayers = compositionLayers.length > 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100%',
        overflowY: 'auto',
        paddingRight: 4,
        paddingBottom: 32,
      }}
      className="custom-scrollbar"
    >
      {/* ── SCENE SETTINGS BENTO ─────────────────────────────────────── */}
      <div className="bento-card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            margin: 0,
            fontWeight: 600,
          }}
        >
          <Settings size={13} color="var(--color-accent)" />
          Cena
        </h3>

        {/* Playhead Display */}
        <div
          style={{
            background: 'var(--color-surface-glass)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={labelStyle}>
            <Clock size={11} /> Playhead
          </span>
          <span
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.02em',
            }}
          >
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Resolution */}
        <Campo label="Resolução" icon={<Frame size={10} />}>
          <select
            value={exportConfig.resolution}
            onChange={(e) => updateExportConfig({ resolution: e.target.value as any })}
            style={selectStyle}
          >
            <option value="1920x1080">1920×1080 — Horizontal 16:9</option>
            <option value="1080x1080">1080×1080 — Quadrado 1:1</option>
            <option value="1080x1920">1080×1920 — Vertical 9:16</option>
            <option value="1350x1080">1350×1080 — Vertical 4:5</option>
          </select>
        </Campo>

        {/* FPS + Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Campo label="Framerate" icon={<Activity size={10} />}>
            <select
              value={exportConfig.fps}
              onChange={(e) => updateExportConfig({ fps: parseInt(e.target.value) })}
              style={selectStyle}
            >
              <option value="24">24 fps — Cinema</option>
              <option value="30">30 fps — Web</option>
              <option value="60">60 fps — Fluido</option>
            </select>
          </Campo>
          <Campo label="Duração" valor={`${exportConfig.duration}s`}>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={exportConfig.duration}
              onChange={(e) => updateExportConfig({ duration: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
            />
          </Campo>
        </div>
      </div>

      {/* ── COMPOSITION STATUS ──────────────────────────────────────── */}
      {!hasLayers ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <Film size={22} />
          </div>
          <div className="empty-state__title">Composição vazia</div>
          <div className="empty-state__desc">
            Arraste um asset para o canvas ou use a Biblioteca para adicionar camadas à sua cena.
          </div>
          <button
            className="empty-state__cta btn-pressable"
            onClick={() => setActivePanel('library')}
          >
            <Film size={13} /> Abrir Biblioteca
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--color-surface-glass)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={labelStyle}>
            <Activity size={11} /> Camadas
          </span>
          <span style={{ ...valueStyle, color: 'var(--color-success)' }}>
            {compositionLayers.length} ativas
          </span>
        </div>
      )}

      {/* ── BACKGROUND UPLOADER BENTO ─────────────────────────────── */}
      <div className="bento-card-premium">
        <BackgroundUploader />
      </div>
    </div>
  )
}
