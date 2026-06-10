/**
 * GenerativePanel — Phase 3 (Updated with Shapes, Colors, Targets & Advanced Controls)
 *
 * Sidebar controls for the Generative SVG engine.
 */
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/useEditorStore'
import { Activity, ChevronDown, ChevronRight, Info, Upload, Trash2, Settings2, Palette, Plus } from 'lucide-react'
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

const BASIC_SHAPES = [
  { name: 'Círculo', svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="var(--color-accent)" /></svg>` },
  { name: 'Quadrado', svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="10" fill="var(--color-accent)" /></svg>` },
  { name: 'Estrela', svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><polygon points="50,5 61,35 95,35 68,54 78,85 50,65 22,85 32,54 5,35 39,35" fill="var(--color-accent)" /></svg>` },
  { name: 'Grade 3x3', svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12"/><circle cx="50" cy="20" r="12"/><circle cx="80" cy="20" r="12"/>
    <circle cx="20" cy="50" r="12"/><circle cx="50" cy="50" r="12"/><circle cx="80" cy="50" r="12"/>
    <circle cx="20" cy="80" r="12"/><circle cx="50" cy="80" r="12"/><circle cx="80" cy="80" r="12"/>
  </svg>` },
  { name: 'Onda', svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path d="M0,50 C25,20 75,80 100,50 L100,100 L0,100 Z" fill="var(--color-accent)" /></svg>`}
]

export function GenerativePanel() {
  const {
    motionConfig, generativeLayers, addGenerativeLayer, removeGenerativeLayer, updateWiggle
  } = useEditorStore()

  const { 
    amplitude, frequency, octaves, persistence, noiseType, seed, 
    propertyFps, targetMode, colorMode, colors, propertyAmplitudes, propertyFrequencies 
  } = motionConfig.wiggle

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
    updateWiggle({ propertyFps: { ...propertyFps, [channel]: fps } })
  }

  const setPropertyAmp = (channel: NoiseChannel, val: number) => {
    updateWiggle({ propertyAmplitudes: { ...propertyAmplitudes, [channel]: val } })
  }

  const setPropertyFreq = (channel: NoiseChannel, val: number) => {
    updateWiggle({ propertyFrequencies: { ...propertyFrequencies, [channel]: val } })
  }

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...(colors || ['#a78bfa'])];
    newColors[index] = newColor;
    updateWiggle({ colors: newColors });
  }

  const channels: NoiseChannel[] = ['x', 'y', 'rotation', 'scale', 'scaleX', 'scaleY', 'skew', 'opacity']
  const fpsOptions = [2, 4, 6, 8, 10]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflowY: 'auto', paddingRight: 4 }} className="custom-scrollbar">
      
      {/* ─── SEÇÃO 0: IMPORTAR & FORMAS ───────────────────────────────── */}
      <Section icon={<Upload size={13} color="var(--color-accent)" />} title="Camadas SVG" defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {BASIC_SHAPES.map((shape) => (
              <button 
                key={shape.name} 
                onClick={() => addGenerativeLayer(shape.svg)}
                style={{ 
                  background: 'var(--color-surface-glass)', border: '1px solid var(--color-surface-border)', 
                  borderRadius: 4, padding: '6px', fontSize: '0.65rem', color: 'var(--color-text-secondary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                }}
              >
                <Plus size={10} /> {shape.name}
              </button>
            ))}
          </div>

          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', border: '1px dashed var(--color-surface-border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            color: 'var(--color-text-secondary)', fontSize: '0.8rem',
            background: 'var(--color-bg-elevated)', transition: 'all 0.2s', marginTop: 4
          }}>
            <Upload size={16} />
            <span>Importar SVGs customizados</span>
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

      {/* ─── SEÇÃO 1: ESTILO & ALVO ───────────────────────────────── */}
      <Section icon={<Palette size={13} color="var(--color-accent)" />} title="Aparência & Alvo" defaultOpen>
        <Campo label="Modo Alvo" dica="Aplica movimento ao SVG inteiro ou quebra o SVG em suas camadas internas (paths).">
          <select value={targetMode || 'layers'} onChange={(e) => updateWiggle({ targetMode: e.target.value as any })} style={selectStyle}>
            <option value="layers">Camadas Internas (Paths)</option>
            <option value="group">SVG Inteiro (Grupo)</option>
          </select>
        </Campo>

        <Campo label="Modo de Cor" dica="Injeta cor Solid, Duotone ou Tritone automaticamente nas camadas do SVG.">
          <select value={colorMode || 'solid'} onChange={(e) => updateWiggle({ colorMode: e.target.value as any })} style={selectStyle}>
            <option value="solid">Solid (1 Cor)</option>
            <option value="duotone">Duotone (2 Cores)</option>
            <option value="tritone">Tritone (3 Cores)</option>
          </select>
        </Campo>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {Array.from({ length: colorMode === 'solid' ? 1 : colorMode === 'duotone' ? 2 : 3 }).map((_, i) => (
            <input 
              key={i} 
              type="color" 
              value={(colors || [])[i] || '#a78bfa'} 
              onChange={(e) => handleColorChange(i, e.target.value)} 
              style={{ width: 32, height: 32, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
            />
          ))}
        </div>
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 2: MOVIMENTO ORGÂNICO ─────────────────────────────── */}
      <Section icon={<Activity size={13} color="var(--color-accent)" />} title="Movimento Global" defaultOpen>
        <Row2>
          <Campo label="Amplitude Mestra" valor={amplitude} dica="O quanto os elementos se deslocam no geral.">
            <input type="range" min={1} max={100} step={1} value={amplitude} onChange={(e) => updateWiggle({ amplitude: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Freq. Mestra" valor={frequency} dica="Velocidade base do movimento.">
            <input type="range" min={0.05} max={2.0} step={0.05} value={frequency} onChange={(e) => updateWiggle({ frequency: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>
        <Row2>
          <Campo label="Complexidade" valor={octaves} dica="Mais camadas (octaves) = movimento ruidoso.">
            <input type="range" min={1} max={6} step={1} value={octaves} onChange={(e) => updateWiggle({ octaves: parseInt(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Persistência" valor={persistence} dica="Decaimento da complexidade.">
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

      {/* ─── SEÇÃO 3: CONTROLES AVANÇADOS ─────────────────────────────── */}
      <Section icon={<Settings2 size={13} color="var(--color-warning)" />} title="Controles por Propriedade" defaultOpen={false}>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Escale a Amplitude (Amp) e Frequência (Frq) especificamente para cada transformação, permitindo focar a distorção em um só eixo ou rotação. Posterize individual cria stop-motion.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {channels.map(channel => {
            const currentFps = propertyFps?.[channel];
            const currentAmp = propertyAmplitudes?.[channel] ?? 1.0;
            const currentFreq = propertyFrequencies?.[channel] ?? 1.0;
            
            return (
              <div key={channel} style={{ background: 'var(--color-surface-glass)', padding: 10, borderRadius: 6, border: '1px solid var(--color-surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {channel.toUpperCase()}
                  </span>
                  <select 
                    value={currentFps === undefined ? 'fluido' : currentFps.toString()} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setPropertyFps(channel, val === 'fluido' ? undefined : parseInt(val));
                    }}
                    style={{ ...selectStyle, width: 'auto', minWidth: 90, padding: '2px 6px', fontSize: '0.7rem' }}
                  >
                    <option value="fluido">Fluido</option>
                    {fpsOptions.map(fps => <option key={fps} value={fps}>{fps} fps</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Campo label="Amp" valor={currentAmp.toFixed(1)}>
                    <input type="range" min={0} max={3} step={0.1} value={currentAmp} onChange={(e) => setPropertyAmp(channel, parseFloat(e.target.value))} style={sliderStyle} />
                  </Campo>
                  <Campo label="Frq" valor={currentFreq.toFixed(1)}>
                    <input type="range" min={0} max={3} step={0.1} value={currentFreq} onChange={(e) => setPropertyFreq(channel, parseFloat(e.target.value))} style={sliderStyle} />
                  </Campo>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <div style={{ height: 40 }} />
    </div>
  )
}

