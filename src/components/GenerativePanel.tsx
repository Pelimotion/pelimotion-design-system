/**
 * GenerativePanel — Phase 3
 *
 * Sidebar controls for the Generative SVG engine.
 * Drives WiggleConfig and PosterizeTime via Zustand store.
 */
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/useEditorStore'
import { Activity, ChevronDown, ChevronRight, Info, Clock } from 'lucide-react'

// ─── Design tokens (shared style objects) ─────────────────────────────────────
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
  fontSize: '0.72rem', fontWeight: 600,
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.04em', textTransform: 'uppercase' as const,
}
const valueStyle: React.CSSProperties = {
  fontSize: '0.72rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)',
}
const sliderStyle: React.CSSProperties = {
  width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer',
}

// ─── Tooltip (portal-based, escapes overflow) ─────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  return (
    <span
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        setPos({ x: r.right + 10, y: r.top + r.height / 2 })
      }}
      onMouseLeave={() => setPos(null)}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
    >
      <Info size={11} color="var(--color-text-secondary)" style={{ opacity: 0.45 }} />
      {pos && createPortal(
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y, transform: 'translateY(-50%)',
          zIndex: 9999, background: '#1a1a2e',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 8, padding: '8px 12px',
          fontSize: '0.75rem', color: 'var(--color-text-primary)',
          lineHeight: 1.55, maxWidth: 240,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', pointerEvents: 'none',
        }}>
          {text}
        </div>,
        document.body
      )}
    </span>
  )
}

function Section({ icon, title, defaultOpen = true, children }: {
  icon: React.ReactNode; title: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: open ? 'rgba(167,139,250,0.06)' : 'transparent',
        border: 'none', borderRadius: 'var(--radius-sm)',
        padding: '8px 10px', cursor: 'pointer',
        color: 'var(--color-text-secondary)', width: '100%',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {icon}{title}
        </span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && (
        <div style={{ padding: '12px 2px 6px 2px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

function Campo({ label, valor, dica, children }: {
  label: string; valor?: string | number; dica?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, ...labelStyle }}>
          {label}{dica && <Tooltip text={dica} />}
        </span>
        {valor !== undefined && <span style={valueStyle}>{valor}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────
export function GenerativePanel() {
  const {
    motionConfig, posterizeEnabled, posterizeFps,
    updateWiggle, togglePosterize, setPosterizeFps,
  } = useEditorStore()

  const { amplitude, frequency, octaves, persistence, noiseType, seed } = motionConfig.wiggle
  const availableFps = motionConfig.posterizeTime.availableRates

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflowY: 'auto', paddingRight: 4 }}
      className="custom-scrollbar"
    >
      {/* ─── SEÇÃO 1: MOVIMENTO ORGÂNICO ─────────────────────────────── */}
      <Section icon={<Activity size={13} color="var(--color-accent)" />} title="Movimento Orgânico" defaultOpen>

        <Row2>
          <Campo label="Amplitude" valor={amplitude} dica="O quanto cada elemento se desloca. Valores maiores = movimento mais dramático. 10–30 é o sweet spot.">
            <input type="range" min={1} max={100} step={1} value={amplitude}
              onChange={(e) => updateWiggle({ amplitude: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Frequência" valor={frequency} dica="Quão rápido o movimento muda de direção. Baixo = oscilação lenta e suave. Alto = movimento frenético.">
            <input type="range" min={0.05} max={2.0} step={0.05} value={frequency}
              onChange={(e) => updateWiggle({ frequency: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>

        <Row2>
          <Campo label="Camadas de ruído" valor={octaves} dica="Mais camadas = movimento mais complexo e orgânico, como turbulência natural. 2–4 é ideal.">
            <input type="range" min={1} max={6} step={1} value={octaves}
              onChange={(e) => updateWiggle({ octaves: parseInt(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Persistência" valor={persistence} dica="Quanto cada camada de ruído contribui em relação à anterior. 0.5 = decai pela metade a cada camada.">
            <input type="range" min={0.1} max={0.9} step={0.05} value={persistence}
              onChange={(e) => updateWiggle({ persistence: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>

        <Row2>
          <Campo label="Tipo de ruído" dica="Simplex 2D é mais leve. 3D adiciona uma terceira dimensão de variação, produzindo movimentos ainda mais naturais.">
            <select value={noiseType} onChange={(e) => updateWiggle({ noiseType: e.target.value as any })} style={selectStyle}>
              <option value="simplex2D">Simplex 2D</option>
              <option value="simplex3D">Simplex 3D</option>
            </select>
          </Campo>
          <Campo label="Semente" valor={seed} dica="Número que define o padrão de movimento. Mude para obter um movimento completamente diferente com os mesmos parâmetros.">
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="range" min={1} max={999} step={1} value={seed}
                onChange={(e) => updateWiggle({ seed: parseInt(e.target.value) })} style={{ ...sliderStyle, flex: 1 }} />
              <button
                onClick={() => updateWiggle({ seed: Math.floor(Math.random() * 999) + 1 })}
                title="Semente aleatória"
                style={{
                  flexShrink: 0, fontSize: '0.7rem',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-surface-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-accent)', cursor: 'pointer',
                  padding: '0 6px',
                }}
              >
                ⟳
              </button>
            </div>
          </Campo>
        </Row2>

      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 2: POSTERIZE TIME ──────────────────────────────── */}
      <Section icon={<Clock size={13} color={posterizeEnabled ? 'var(--color-warning)' : 'var(--color-text-secondary)'} />} title="Efeito Stop-Motion" defaultOpen>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--color-bg-elevated)',
          border: `1px solid ${posterizeEnabled ? 'hsla(40,100%,50%,0.25)' : 'var(--color-surface-border)'}`,
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          transition: 'border-color 0.2s',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Posterize Time
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>
              Força um frame-rate reduzido — visual estilo stop-motion
            </span>
          </div>
          <button
            onClick={togglePosterize}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: posterizeEnabled ? 'hsla(40,100%,50%,0.15)' : 'var(--color-bg-elevated)',
              border: `1px solid ${posterizeEnabled ? 'var(--color-warning)' : 'var(--color-surface-border)'}`,
              borderRadius: 99, padding: '5px 12px',
              color: posterizeEnabled ? 'var(--color-warning)' : 'var(--color-text-secondary)',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            {posterizeEnabled ? 'Ativo' : 'Off'}
          </button>
        </div>

        {posterizeEnabled && (
          <Campo label="Frame Rate" valor={`${posterizeFps}fps`} dica="Quantos quadros por segundo o motor generativo renderiza. 12fps = look clássico de animação. 8fps = stop-motion artesanal.">
            <div style={{ display: 'flex', gap: 8 }}>
              {availableFps.map((fps) => (
                <button
                  key={fps}
                  onClick={() => setPosterizeFps(fps)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: `1px solid ${posterizeFps === fps ? 'var(--color-warning)' : 'var(--color-surface-border)'}`,
                    background: posterizeFps === fps ? 'hsla(40,100%,50%,0.12)' : 'var(--color-bg-elevated)',
                    color: posterizeFps === fps ? 'var(--color-warning)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {fps}
                </button>
              ))}
            </div>
          </Campo>
        )}

      </Section>

      <div style={{ height: 40 }} />
    </div>
  )
}
