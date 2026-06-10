/**
 * GenerativePanel — Phase 3 (Updated for SVG Upload & Per-Property FPS)
 *
 * Sidebar controls for the Generative SVG engine.
 */
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/useEditorStore'
import { Activity, ChevronDown, ChevronRight, Info, Upload, Trash2, Settings2 } from 'lucide-react'
import type { NoiseChannel } from '@/types/motion.types'

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-elevated)', border: '1px solid var(--color-surface-border)',
  borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)',
  padding: '6px 8px', fontSize: '0.8rem', outline: 'none', width: '100%', cursor: 'pointer',
}
const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)',
  letterSpacing: '0.04em', textTransform: 'uppercase' as const,
}
const valueStyle: React.CSSProperties = {
  fontSize: '0.72rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)',
}
const sliderStyle: React.CSSProperties = {
  width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer',
}

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
          zIndex: 9999, background: '#1a1a2e', border: '1px solid var(--color-surface-border)',
          borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem', color: 'var(--color-text-primary)',
          lineHeight: 1.55, maxWidth: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', pointerEvents: 'none',
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
        padding: '8px 10px', cursor: 'pointer', color: 'var(--color-text-secondary)', width: '100%',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {icon}{title}
        </span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && <div style={{ padding: '12px 2px 6px 2px', display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>}
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

export function GenerativePanel() {
  const {
    motionConfig, generativeLayers, addGenerativeLayer, removeGenerativeLayer, updateWiggle
  } = useEditorStore()

  const { amplitude, frequency, octaves, persistence, noiseType, seed, propertyFps } = motionConfig.wiggle

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const svgString = event.target?.result as string
        if (svgString && svgString.includes('<svg')) {
          addGenerativeLayer(svgString)
        }
      }
      reader.readAsText(file)
    })
    e.target.value = '' // reset input
  }

  const setPropertyFps = (channel: NoiseChannel, fps: number | undefined) => {
    updateWiggle({
      propertyFps: {
        ...propertyFps,
        [channel]: fps
      }
    })
  }

  const channels: NoiseChannel[] = ['x', 'y', 'rotation', 'scale', 'scaleX', 'scaleY', 'skew', 'opacity']
  const fpsOptions = [2, 4, 6, 8, 10]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflowY: 'auto', paddingRight: 4 }} className="custom-scrollbar">
      
      {/* ─── SEÇÃO 0: IMPORTAR SVG ───────────────────────────────── */}
      <Section icon={<Upload size={13} color="var(--color-accent)" />} title="Camadas SVG" defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', border: '1px dashed var(--color-surface-border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            color: 'var(--color-text-secondary)', fontSize: '0.8rem',
            background: 'var(--color-bg-elevated)', transition: 'all 0.2s'
          }}>
            <Upload size={16} />
            <span>Importar um ou mais SVGs</span>
            <input type="file" accept=".svg" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>

          {generativeLayers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {generativeLayers.map((_layer, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--color-surface-glass)', padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-border)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>Camada {index + 1}</span>
                  <button onClick={() => removeGenerativeLayer(index)} style={{
                    background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 4
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 1: MOVIMENTO ORGÂNICO ─────────────────────────────── */}
      <Section icon={<Activity size={13} color="var(--color-accent)" />} title="Movimento Orgânico" defaultOpen>
        <Row2>
          <Campo label="Amplitude" valor={amplitude} dica="O quanto cada elemento se desloca.">
            <input type="range" min={1} max={100} step={1} value={amplitude} onChange={(e) => updateWiggle({ amplitude: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Frequência" valor={frequency} dica="Quão rápido o movimento muda de direção.">
            <input type="range" min={0.05} max={2.0} step={0.05} value={frequency} onChange={(e) => updateWiggle({ frequency: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>
        <Row2>
          <Campo label="Camadas (Octaves)" valor={octaves} dica="Mais camadas = movimento mais complexo.">
            <input type="range" min={1} max={6} step={1} value={octaves} onChange={(e) => updateWiggle({ octaves: parseInt(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Persistência" valor={persistence} dica="Decaimento por camada.">
            <input type="range" min={0.1} max={0.9} step={0.05} value={persistence} onChange={(e) => updateWiggle({ persistence: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>
        <Row2>
          <Campo label="Tipo de ruído" dica="Simplex 2D ou 3D.">
            <select value={noiseType} onChange={(e) => updateWiggle({ noiseType: e.target.value as any })} style={selectStyle}>
              <option value="simplex2D">Simplex 2D</option>
              <option value="simplex3D">Simplex 3D</option>
            </select>
          </Campo>
          <Campo label="Semente" valor={seed} dica="Semente determinística.">
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="range" min={1} max={999} step={1} value={seed} onChange={(e) => updateWiggle({ seed: parseInt(e.target.value) })} style={{ ...sliderStyle, flex: 1 }} />
            </div>
          </Campo>
        </Row2>
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 2: POSTERIZE POR PROPRIEDADE ─────────────────────────────── */}
      <Section icon={<Settings2 size={13} color="var(--color-warning)" />} title="Posterize (FPS por Propriedade)" defaultOpen>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Configure o FPS individualmente para cada propriedade de transformação, criando visuais únicos de animação "travada" (Stop-Motion). Deixe como "Fluido" para não afetar a propriedade.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {channels.map(channel => {
            const currentFps = propertyFps?.[channel];
            return (
              <div key={channel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {channel.toUpperCase()}
                </span>
                <select 
                  value={currentFps === undefined ? 'fluido' : currentFps.toString()} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setPropertyFps(channel, val === 'fluido' ? undefined : parseInt(val));
                  }}
                  style={{ ...selectStyle, width: 'auto', minWidth: 100, padding: '4px 8px' }}
                >
                  <option value="fluido">Fluido (60+)</option>
                  {fpsOptions.map(fps => (
                    <option key={fps} value={fps}>{fps} fps</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </Section>

      <div style={{ height: 40 }} />
    </div>
  )
}
