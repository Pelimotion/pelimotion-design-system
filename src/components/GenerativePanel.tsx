/**
 * GenerativePanel — Phase 4
 *
 * Sidebar controls for the Generative SVG engine.
 */
import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/useEditorStore'
import { Activity, ChevronDown, ChevronRight, Info, Upload, Trash2, Settings2, Palette, Plus, MousePointer2 } from 'lucide-react'
import type { NoiseChannel, GenerativeShapeType } from '@/types/motion.types'

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

const SHAPE_BUTTONS: { name: string; type: GenerativeShapeType }[] = [
  { name: 'Círculo', type: 'circle' },
  { name: 'Quadrado', type: 'square' },
  { name: 'Estrela', type: 'star' },
  { name: 'Hexágono', type: 'hexagon' },
  { name: 'Grade 3x3', type: 'grid' },
  { name: 'Onda', type: 'wave' },
  { name: 'Spirograph', type: 'spirograph' },
  { name: 'Orbital', type: 'orbital' },
]

export function GenerativePanel() {
  const {
    motionConfig, generativeLayers, activeGenerativeLayerId,
    addGenerativeLayer, removeGenerativeLayer, setActiveGenerativeLayerId, 
    updateLayerTransform, updateLayerShapeProps, updateWiggle
  } = useEditorStore()

  const { 
    amplitude, frequency, octaves, persistence, noiseType, seed, 
    propertyFps, targetMode, colorMode, colors, propertyAmplitudes, propertyFrequencies, previewGrid 
  } = motionConfig.wiggle

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const svgString = event.target?.result as string
        if (svgString && svgString.includes('<svg')) {
          addGenerativeLayer({
            id: Math.random().toString(36).substr(2, 9),
            name: `Importado ${file.name}`,
            type: 'raw',
            svgString,
            transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 }
          })
        }
      }
      reader.readAsText(file)
    })
    e.target.value = '' // reset input
  }

  const addShape = (type: GenerativeShapeType, name: string) => {
    addGenerativeLayer({
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
      shapeProps: {}
    })
  }

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...(colors || ['#a78bfa'])];
    newColors[index] = newColor;
    updateWiggle({ colors: newColors });
  }

  const activeLayer = generativeLayers.find(l => l.id === activeGenerativeLayerId);
  const channels: NoiseChannel[] = ['x', 'y', 'rotation', 'scale', 'scaleX', 'scaleY', 'skew', 'opacity']
  const fpsOptions = [2, 4, 6, 8, 10]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflowY: 'auto', paddingRight: 4 }} className="custom-scrollbar">
      
      {/* ─── SEÇÃO 0: IMPORTAR & FORMAS ───────────────────────────────── */}
      <Section icon={<Upload size={13} color="var(--color-accent)" />} title="Composição de Camadas" defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {SHAPE_BUTTONS.map((shape) => (
              <button 
                key={shape.name} 
                onClick={() => addShape(shape.type, shape.name)}
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
            <span>Importar SVG Customizado</span>
            <input type="file" accept=".svg" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>

          {generativeLayers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {generativeLayers.map((layer) => {
                const isActive = layer.id === activeGenerativeLayerId;
                return (
                  <div key={layer.id} onClick={() => setActiveGenerativeLayerId(layer.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: isActive ? 'rgba(167,139,250,0.1)' : 'var(--color-surface-glass)', 
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)', 
                    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: isActive ? 600 : 400 }}>
                      {layer.name}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); removeGenerativeLayer(layer.id); }} style={{
                      background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 4
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SEÇÃO 1.5: EDIÇÃO DA CAMADA ATIVA ───────────────────────────────── */}
      {activeLayer && (
        <>
          <Section icon={<MousePointer2 size={13} color="var(--color-accent)" />} title={`Editando: ${activeLayer.name}`} defaultOpen>
            {/* Basic Transforms */}
            <Row2>
              <Campo label="Posição X" valor={activeLayer.transform.x}>
                <input type="range" min={-500} max={500} step={1} value={activeLayer.transform.x} 
                  onChange={(e) => updateLayerTransform(activeLayer.id, { x: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Posição Y" valor={activeLayer.transform.y}>
                <input type="range" min={-500} max={500} step={1} value={activeLayer.transform.y} 
                  onChange={(e) => updateLayerTransform(activeLayer.id, { y: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Row2>
              <Campo label="Escala" valor={activeLayer.transform.scale.toFixed(2)}>
                <input type="range" min={0.1} max={5} step={0.1} value={activeLayer.transform.scale} 
                  onChange={(e) => updateLayerTransform(activeLayer.id, { scale: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Rotação" valor={`${activeLayer.transform.rotation}°`}>
                <input type="range" min={-180} max={180} step={1} value={activeLayer.transform.rotation} 
                  onChange={(e) => updateLayerTransform(activeLayer.id, { rotation: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Campo label="Opacidade" valor={activeLayer.transform.opacity.toFixed(2)}>
              <input type="range" min={0} max={1} step={0.05} value={activeLayer.transform.opacity} 
                onChange={(e) => updateLayerTransform(activeLayer.id, { opacity: parseFloat(e.target.value) })} style={sliderStyle} />
            </Campo>

            {/* Shape-specific props */}
            {activeLayer.type === 'star' && (
              <>
                <Row2>
                  <Campo label="Pontas" valor={activeLayer.shapeProps?.points || 5}>
                    <input type="range" min={3} max={20} step={1} value={activeLayer.shapeProps?.points || 5} 
                      onChange={(e) => updateLayerShapeProps(activeLayer.id, { points: parseInt(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Raio Interno" valor={activeLayer.shapeProps?.innerRadius || 20}>
                    <input type="range" min={5} max={45} step={1} value={activeLayer.shapeProps?.innerRadius || 20} 
                      onChange={(e) => updateLayerShapeProps(activeLayer.id, { innerRadius: parseInt(e.target.value) })} style={sliderStyle} />
                  </Campo>
                </Row2>
              </>
            )}
            
            {activeLayer.type === 'spirograph' && (
              <Row2>
                <Campo label="Raio Externo" valor={activeLayer.shapeProps?.outerR || 30}>
                  <input type="range" min={10} max={80} step={1} value={activeLayer.shapeProps?.outerR || 30} 
                    onChange={(e) => updateLayerShapeProps(activeLayer.id, { outerR: parseInt(e.target.value) })} style={sliderStyle} />
                </Campo>
                <Campo label="Raio Interno" valor={activeLayer.shapeProps?.innerR || 12}>
                  <input type="range" min={5} max={50} step={1} value={activeLayer.shapeProps?.innerR || 12} 
                    onChange={(e) => updateLayerShapeProps(activeLayer.id, { innerR: parseInt(e.target.value) })} style={sliderStyle} />
                </Campo>
              </Row2>
            )}

            {activeLayer.type === 'orbital' && (
              <Row2>
                <Campo label="Anéis" valor={activeLayer.shapeProps?.rings || 3}>
                  <input type="range" min={1} max={10} step={1} value={activeLayer.shapeProps?.rings || 3} 
                    onChange={(e) => updateLayerShapeProps(activeLayer.id, { rings: parseInt(e.target.value) })} style={sliderStyle} />
                </Campo>
                <Campo label="Espaçamento" valor={activeLayer.shapeProps?.spacing || 10}>
                  <input type="range" min={2} max={30} step={1} value={activeLayer.shapeProps?.spacing || 10} 
                    onChange={(e) => updateLayerShapeProps(activeLayer.id, { spacing: parseInt(e.target.value) })} style={sliderStyle} />
                </Campo>
              </Row2>
            )}

            {activeLayer.type === 'circle' && (
              <Campo label="Raio" valor={activeLayer.shapeProps?.radius || 40}>
                <input type="range" min={5} max={100} step={1} value={activeLayer.shapeProps?.radius || 40} 
                  onChange={(e) => updateLayerShapeProps(activeLayer.id, { radius: parseInt(e.target.value) })} style={sliderStyle} />
              </Campo>
            )}

          </Section>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />
        </>
      )}

      {/* ─── SEÇÃO 1: ESTILO & ALVO ───────────────────────────────── */}
      <Section icon={<Palette size={13} color="var(--color-accent)" />} title="Aparência Global & Alvo" defaultOpen={false}>
        <Campo label="Visualização do Grid (Canvas)" dica="O Canva é infinito, mas você pode prever onde os limites do aspect ratio ocorrerão na exportação.">
          <select value={previewGrid || 'none'} onChange={(e) => updateWiggle({ previewGrid: e.target.value as any })} style={selectStyle}>
            <option value="none">Oculto (Livre)</option>
            <option value="all">Todas as Proporções</option>
            <option value="16:9">16:9 (Video Padrão)</option>
            <option value="1:1">1:1 (Quadrado)</option>
            <option value="4:5">4:5 (Instagram)</option>
            <option value="9:16">9:16 (Stories/Reels)</option>
          </select>
        </Campo>

        <Campo label="Modo Alvo" dica="Aplica movimento ao wrapper ou aos paths/svgs internos.">
          <select value={targetMode || 'layers'} onChange={(e) => updateWiggle({ targetMode: e.target.value as any })} style={selectStyle}>
            <option value="layers">Camadas Internas (Paths)</option>
            <option value="group">Camada/Grupo Inteiro</option>
          </select>
        </Campo>

        <Campo label="Modo de Cor" dica="Injeta cor Solid, Duotone ou Tritone automaticamente.">
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
      <Section icon={<Activity size={13} color="var(--color-accent)" />} title="Ruído Perlin (Motor)" defaultOpen={false}>
        <Row2>
          <Campo label="Amplitude" valor={amplitude} dica="O quanto os elementos se deslocam no geral.">
            <input type="range" min={1} max={100} step={1} value={amplitude} onChange={(e) => updateWiggle({ amplitude: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Frequência" valor={frequency} dica="Velocidade base do movimento.">
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
          <Campo label="Algoritmo" dica="Simplex 2D ou 3D.">
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
      <Section icon={<Settings2 size={13} color="var(--color-warning)" />} title="Multiplicadores por Eixo" defaultOpen={false}>
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
                      updateWiggle({ propertyFps: { ...propertyFps, [channel]: val === 'fluido' ? undefined : parseInt(val) } })
                    }}
                    style={{ ...selectStyle, width: 'auto', minWidth: 90, padding: '2px 6px', fontSize: '0.7rem' }}
                  >
                    <option value="fluido">Fluido</option>
                    {fpsOptions.map(fps => <option key={fps} value={fps}>{fps} fps</option>)}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Campo label="Amp" valor={currentAmp.toFixed(1)}>
                    <input type="range" min={0} max={3} step={0.1} value={currentAmp} onChange={(e) => updateWiggle({ propertyAmplitudes: { ...propertyAmplitudes, [channel]: parseFloat(e.target.value) } })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Frq" valor={currentFreq.toFixed(1)}>
                    <input type="range" min={0} max={3} step={0.1} value={currentFreq} onChange={(e) => updateWiggle({ propertyFrequencies: { ...propertyFrequencies, [channel]: parseFloat(e.target.value) } })} style={sliderStyle} />
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

