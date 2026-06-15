import React from 'react'
import { Settings, Frame, Film, Play, Pause, Trash2, Image, Video, Layers, Music, Clock } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { BackgroundUploader } from './BackgroundUploader'

function formatTime(seconds: number): string {
  const m  = Math.floor(seconds / 60)
  const s  = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
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

function LayerTypeIcon({ type }: { type: string }) {
  const iconProps = { size: 11, style: { flexShrink: 0 } as React.CSSProperties }
  if (type === 'localAsset' || type === 'cloudAsset') return <Image {...iconProps} />
  if (type === 'video') return <Video {...iconProps} />
  if (type === 'audio') return <Music {...iconProps} />
  return <Layers {...iconProps} />
}

export function CompositionPanel() {
  const {
    exportConfig,
    currentTime,
    compositionLayers,
    setActivePanel,
    isPlaying,
    togglePlayback,
    removeCompositionLayer,
    activeCompositionLayerId,
    setActiveCompositionLayerId,
  } = useEditorStore()

  const hasLayers = compositionLayers.length > 0
  const totalDuration = exportConfig.duration

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        height: '100%',
        overflowY: 'auto',
        paddingRight: 4,
        paddingBottom: 32,
      }}
      className="custom-scrollbar"
    >
      {/* ── PLAYBACK CONTROLE BENTO ─────────────────────────────────────── */}
      <div className="bento-card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: '12px' }}>
        <h3 style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontWeight: 600 }}>
          <Settings size={13} color="var(--color-accent)" />
          Cena
        </h3>

        {/* Playhead + Play/Pause */}
        <div style={{
          background: 'var(--color-surface-glass)',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <button
            className="btn-pressable"
            onClick={togglePlayback}
            title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
            style={{
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              color: '#000',
              boxShadow: '0 2px 10px hsla(191,100%,50%,0.3)',
            }}
          >
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 1 }} />}
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ ...labelStyle }}>
                <Clock size={10} /> Playhead
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>
                {formatTime(currentTime)}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 3, background: 'var(--color-surface-border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (currentTime / totalDuration) * 100)}%`,
                background: 'var(--color-accent)',
                borderRadius: 2,
                transition: 'width 0.1s linear',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>00:00.00</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CAMADAS DA COMPOSIÇÃO ────────────────────────────────────── */}
      <div className="bento-card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontWeight: 600 }}>
            <Frame size={13} color="var(--color-accent)" />
            Camadas
          </h3>
          {hasLayers && (
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
              {compositionLayers.length} ativa{compositionLayers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {!hasLayers ? (
          <div className="empty-state" style={{ padding: '16px 8px' }}>
            <div className="empty-state__icon">
              <Film size={20} />
            </div>
            <div className="empty-state__title" style={{ fontSize: '0.82rem' }}>Composição vazia</div>
            <div className="empty-state__desc" style={{ fontSize: '0.72rem' }}>
              Arraste assets para o canvas ou use a Biblioteca.
            </div>
            <button
              className="empty-state__cta btn-pressable"
              onClick={() => setActivePanel('library')}
              style={{ fontSize: '0.75rem', padding: '7px 14px' }}
            >
              <Film size={12} /> Abrir Biblioteca
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {compositionLayers.map((layer) => {
              const isActive = activeCompositionLayerId === layer.id
              return (
                <div
                  key={layer.id}
                  className="layer-row"
                  onClick={() => setActiveCompositionLayerId(layer.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    borderRadius: 8,
                    background: isActive ? 'var(--color-accent-muted)' : 'var(--color-surface-glass)',
                    border: `1px solid ${isActive ? 'hsla(191,100%,50%,0.25)' : 'var(--color-surface-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s var(--ease-smooth)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-glass-hover)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-glass)'
                  }}
                >
                  <div style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)', flexShrink: 0 }}>
                    <LayerTypeIcon type={layer.type} />
                  </div>
                  <span style={{
                    flex: 1,
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {layer.name}
                  </span>
                  <button
                    className="btn-pressable layer-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCompositionLayer(layer.id)
                    }}
                    title="Remover camada"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-ghost)',
                      cursor: 'pointer',
                      padding: 3,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                      transition: 'color 0.15s, opacity 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text-ghost)'
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── BACKGROUND UPLOADER BENTO ─────────────────────────────── */}
      <div className="bento-card-premium" style={{ borderRadius: '12px' }}>
        <BackgroundUploader />
      </div>
    </div>
  )
}
