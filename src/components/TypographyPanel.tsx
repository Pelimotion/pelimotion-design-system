import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/useEditorStore'
import type {
  TypographyLayer,
  TypoLayerAnimation,
  TypoLayerTransform,
  TypographyLayoutMode,
  EntryPreset,
  ExitPreset,
  SplitMode,
  StaggerFrom,
  IdleMotionType,
} from '@/types/motion.types'
import {
  Sparkles, ChevronDown, ChevronRight,
  Info, Eye, EyeOff, Layout, Link2, Unlink2,
  Heading1, AlignLeft, Move,
  GripVertical,
} from 'lucide-react'

// ─── Design tokens ────────────────────────────────────────────────────────────
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

const sliderStyle: React.CSSProperties = {
  width: '100%',
  accentColor: 'var(--color-accent)',
  cursor: 'pointer',
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const handleEnter = () => {
    if (!iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    setPos({ x: rect.right + 10, y: rect.top + rect.height / 2 })
  }

  return (
    <span
      ref={iconRef}
      onMouseEnter={handleEnter}
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

// ─── Collapsible Section ──────────────────────────────────────────────────────
interface SectionProps {
  icon: React.ReactNode
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ icon, title, badge, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? 'rgba(167,139,250,0.06)' : 'transparent',
          border: 'none', borderRadius: 'var(--radius-sm)',
          padding: '8px 10px', cursor: 'pointer',
          color: 'var(--color-text-secondary)', width: '100%',
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {icon}
          {title}
          {badge && (
            <span style={{
              fontSize: '0.6rem',
              background: badge === 'OFF' ? 'var(--color-surface-border)' : 'var(--color-accent)',
              color: badge === 'OFF' ? 'var(--color-text-secondary)' : '#0a0a0f',
              borderRadius: 99, padding: '1px 7px',
              fontWeight: 800, letterSpacing: 0, textTransform: 'none',
            }}>
              {badge}
            </span>
          )}
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

// ─── Layout Helpers ───────────────────────────────────────────────────────────
function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

function Row3({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>{children}</div>
}

// ─── Campo (Field with label, value, tooltip) ─────────────────────────────────
function Campo({
  label, valor, dica, children,
}: {
  label: string; valor?: string | number; dica?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, ...labelStyle }}>
          {label}
          {dica && <Tooltip text={dica} />}
        </span>
        {valor !== undefined && <span style={valueStyle}>{valor}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Toggle Button ────────────────────────────────────────────────────────────
function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: active ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
        borderRadius: 99, padding: '5px 12px',
        color: active ? '#0a0a0f' : 'var(--color-text-secondary)',
        cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
        transition: 'all 0.2s',
      }}
    >
      {active ? <Eye size={11} /> : <EyeOff size={11} />}
      {label}
    </button>
  )
}

// ─── Layer Section (Title or Subtitle) ────────────────────────────────────────
function LayerSection({
  layer,
  updateLayer,
  updateTransform,
  availableFonts,
  fetchLocalFonts,
}: {
  layer: TypographyLayer;
  updateLayer: (patch: Partial<TypographyLayer>) => void;
  updateTransform: (patch: Partial<TypoLayerTransform>) => void;
  availableFonts: string[];
  fetchLocalFonts: () => void;
}) {
  const fontesPadrao = ['Inter', 'Space Grotesk', 'Playfair Display', 'Syne', 'JetBrains Mono', 'Bebas Neue'];
  const todasFontes = [...new Set([...fontesPadrao, ...availableFonts])];

  return (
    <>
      {/* Text input */}
      <Campo label="Texto" dica="O conteúdo de texto desta camada.">
        <textarea
          value={layer.text}
          onChange={(e) => updateLayer({ text: e.target.value })}
          placeholder="Digite aqui..."
          rows={2}
          style={{
            width: '100%', background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)',
            padding: '8px 12px', fontSize: '0.9rem', outline: 'none',
            resize: 'vertical', transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--color-surface-border)' }}
        />
      </Campo>

      {/* Font */}
      <Campo label="Fonte" dica="Família tipográfica. Clique '+ Local' para usar fontes do sistema.">
        <div style={{ display: 'flex', gap: 6 }}>
          <select value={layer.fontFamily} onChange={(e) => updateLayer({ fontFamily: e.target.value })} style={selectStyle}>
            {todasFontes.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button
            onClick={fetchLocalFonts}
            title="Carregar fontes do sistema"
            style={{
              flexShrink: 0, fontSize: '0.65rem',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-accent)', cursor: 'pointer',
              padding: '0 8px', whiteSpace: 'nowrap',
            }}
          >
            + Local
          </button>
        </div>
      </Campo>

      <Row2>
        <Campo label="Tamanho" valor={`${layer.fontSize}rem`} dica="Tamanho da fonte em rem. Controle preciso do tamanho visual.">
          <input type="range" min={0.5} max={20} step={0.1} value={layer.fontSize}
            onChange={(e) => updateLayer({ fontSize: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
        <Campo label="Espessura" valor={layer.fontWeight} dica="Peso da fonte. 100=fino, 400=normal, 700=negrito, 900=ultra.">
          <input type="range" min={100} max={900} step={100} value={layer.fontWeight}
            onChange={(e) => updateLayer({ fontWeight: parseInt(e.target.value) })} style={sliderStyle} />
        </Campo>
      </Row2>

      <Row2>
        <Campo label="Cor" dica="Cor do texto desta camada.">
          <input
            type="color" value={layer.color || '#ffffff'}
            onChange={(e) => updateLayer({ color: e.target.value })}
            style={{ width: '100%', height: 34, padding: 0, border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}
          />
        </Campo>
        <Campo label="Caixa">
          <select value={layer.textTransform} onChange={(e) => updateLayer({ textTransform: e.target.value as any })} style={selectStyle}>
            <option value="none">Como digitado</option>
            <option value="uppercase">MAIÚSCULAS</option>
            <option value="lowercase">minúsculas</option>
            <option value="capitalize">Primeira Maiúscula</option>
          </select>
        </Campo>
      </Row2>

      <Row3>
        <Campo label="Espaço letras" valor={`${layer.letterSpacing}em`}>
          <input type="range" min={-0.1} max={0.5} step={0.01} value={layer.letterSpacing}
            onChange={(e) => updateLayer({ letterSpacing: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
        <Campo label="Altura linha" valor={layer.lineHeight}>
          <input type="range" min={0.8} max={2.5} step={0.05} value={layer.lineHeight}
            onChange={(e) => updateLayer({ lineHeight: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
        <Campo label="Largura máx" valor={`${layer.maxWidth}%`} dica="Largura máxima como % do viewport.">
          <input type="range" min={20} max={100} step={5} value={layer.maxWidth}
            onChange={(e) => updateLayer({ maxWidth: parseInt(e.target.value) })} style={sliderStyle} />
        </Campo>
      </Row3>

      <Row2>
        <Campo label="Alinhamento">
          <select value={layer.textAlign} onChange={(e) => updateLayer({ textAlign: e.target.value as any })} style={selectStyle}>
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
            <option value="right">Direita</option>
          </select>
        </Campo>
        <Campo label="Estilo">
          <select value={layer.fontStyle} onChange={(e) => updateLayer({ fontStyle: e.target.value as any })} style={selectStyle}>
            <option value="normal">Normal</option>
            <option value="italic">Itálico</option>
          </select>
        </Campo>
      </Row2>

      {/* Transform controls */}
      <details style={{ paddingTop: 2 }}>
        <summary style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
          textTransform: 'uppercase', color: 'var(--color-text-secondary)',
          cursor: 'pointer', userSelect: 'none', listStyle: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
          paddingBottom: 10, paddingTop: 4,
        }}>
          <Move size={11} /> Posição e transformação
        </summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <Row2>
            <Campo label="X" valor={`${layer.transform.x}px`}>
              <input type="range" min={-500} max={500} step={1} value={layer.transform.x}
                onChange={(e) => updateTransform({ x: parseFloat(e.target.value) })} style={sliderStyle} />
            </Campo>
            <Campo label="Y" valor={`${layer.transform.y}px`}>
              <input type="range" min={-500} max={500} step={1} value={layer.transform.y}
                onChange={(e) => updateTransform({ y: parseFloat(e.target.value) })} style={sliderStyle} />
            </Campo>
          </Row2>
          <Row3>
            <Campo label="Escala" valor={`${(layer.transform.scale * 100).toFixed(0)}%`}>
              <input type="range" min={0.1} max={3} step={0.01} value={layer.transform.scale}
                onChange={(e) => updateTransform({ scale: parseFloat(e.target.value) })} style={sliderStyle} />
            </Campo>
            <Campo label="Rotação" valor={`${layer.transform.rotation}°`}>
              <input type="range" min={-180} max={180} step={0.5} value={layer.transform.rotation}
                onChange={(e) => updateTransform({ rotation: parseFloat(e.target.value) })} style={sliderStyle} />
            </Campo>
            <Campo label="Opacidade" valor={`${(layer.transform.opacity * 100).toFixed(0)}%`}>
              <input type="range" min={0} max={1} step={0.01} value={layer.transform.opacity}
                onChange={(e) => updateTransform({ opacity: parseFloat(e.target.value) })} style={sliderStyle} />
            </Campo>
          </Row3>
        </div>
      </details>
    </>
  )
}

// ─── Animation Section ────────────────────────────────────────────────────────

const ENTRY_PRESET_LABELS: Record<EntryPreset, string> = {
  fadeUp: '↑ Sobe suave',
  fadeDown: '↓ Desce suave',
  slideLeft: '→ Desliza da direita',
  slideRight: '← Desliza da esquerda',
  scaleIn: '⊕ Zoom de dentro',
  rotateIn: '↻ Rotaciona entrando',
  blurIn: '◎ Desfoque entrando',
  typewriter: '⌨ Máquina de escrever',
  elastic: '🔀 Elástico',
  glitch: '⚡ Glitch',
  custom: '🎛 Personalizado',
};

const EXIT_PRESET_LABELS: Record<ExitPreset, string> = {
  fadeUp: '↑ Sobe suave',
  fadeDown: '↓ Desce suave',
  slideLeft: '← Desliza p/ esquerda',
  slideRight: '→ Desliza p/ direita',
  scaleOut: '⊖ Zoom para fora',
  rotateOut: '↻ Rotaciona saindo',
  blurOut: '◎ Desfoque saindo',
  dissolve: '✦ Dissolve',
  custom: '🎛 Personalizado',
};

const SPLIT_MODE_LABELS: Record<SplitMode, string> = {
  chars: 'Letra a letra',
  words: 'Palavra a palavra',
  lines: 'Linha inteira',
  none: 'Bloco único',
};

const STAGGER_FROM_LABELS: Record<StaggerFrom, string> = {
  start: 'Do início →',
  end: '← Do fim',
  center: '← Centro →',
  edges: '→ Bordas ←',
  random: '✦ Aleatório',
};

const IDLE_LABELS: Record<IdleMotionType, string> = {
  none: 'Nenhum (estático)',
  scaleUp: 'Zoom lento',
  panX: 'Deslizar ← →',
  panY: 'Deslizar para cima',
  float: 'Flutuar',
  breathe: 'Respirar',
  wiggle: 'Tremer',
};

function AnimationSection({
  animation,
  updateAnimation,
  easingKeys,
  nomesCurvas,
  linked,
}: {
  animation: TypoLayerAnimation;
  updateAnimation: (patch: Partial<TypoLayerAnimation>) => void;
  easingKeys: string[];
  nomesCurvas: Record<string, string>;
  linked: boolean;
}) {
  if (linked) {
    return (
      <div style={{
        padding: '16px 12px', borderRadius: 'var(--radius-sm)',
        background: 'rgba(0,212,255,0.05)', border: '1px dashed var(--color-accent)',
        display: 'flex', alignItems: 'center', gap: 10,
        color: 'var(--color-accent)', fontSize: '0.78rem',
      }}>
        <Link2 size={14} />
        <span>Animação vinculada ao Título. Desative "Link Animação" para controlar independentemente.</span>
      </div>
    );
  }

  return (
    <>
      {/* Entry */}
      <Row2>
        <Campo label="Preset de entrada" dica="Estilo pré-configurado de como o texto entra na tela.">
          <select value={animation.entryPreset} onChange={(e) => updateAnimation({ entryPreset: e.target.value as EntryPreset })} style={selectStyle}>
            {(Object.keys(ENTRY_PRESET_LABELS) as EntryPreset[]).map(k => (
              <option key={k} value={k}>{ENTRY_PRESET_LABELS[k]}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Split Mode" dica="Como o texto é dividido para animação.">
          <select value={animation.splitMode} onChange={(e) => updateAnimation({ splitMode: e.target.value as SplitMode })} style={selectStyle}>
            {(Object.keys(SPLIT_MODE_LABELS) as SplitMode[]).map(k => (
              <option key={k} value={k}>{SPLIT_MODE_LABELS[k]}</option>
            ))}
          </select>
        </Campo>
      </Row2>

      <Row2>
        <Campo label="Duração" valor={`${animation.entryDuration}s`}>
          <input type="range" min={0.1} max={3.0} step={0.05} value={animation.entryDuration}
            onChange={(e) => updateAnimation({ entryDuration: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
        <Campo label="Cascata" valor={`${animation.entryStagger}s`} dica="Atraso entre cada elemento dividido.">
          <input type="range" min={0.0} max={0.3} step={0.005} value={animation.entryStagger}
            onChange={(e) => updateAnimation({ entryStagger: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
      </Row2>

      <Row2>
        <Campo label="Curva (ease)" dica="Aceleração da animação de entrada.">
          <select value={animation.entryEase} onChange={(e) => updateAnimation({ entryEase: e.target.value })} style={selectStyle}>
            {easingKeys.map(k => <option key={k} value={k}>{nomesCurvas[k] || k}</option>)}
          </select>
        </Campo>
        <Campo label="Direção cascata" dica="De onde a cascata de stagger começa.">
          <select value={animation.staggerFrom} onChange={(e) => updateAnimation({ staggerFrom: e.target.value as StaggerFrom })} style={selectStyle}>
            {(Object.keys(STAGGER_FROM_LABELS) as StaggerFrom[]).map(k => (
              <option key={k} value={k}>{STAGGER_FROM_LABELS[k]}</option>
            ))}
          </select>
        </Campo>
      </Row2>

      <Campo label="Delay de entrada" valor={`${animation.entryDelay}s`} dica="Atraso antes desta camada começar a animar.">
        <input type="range" min={0} max={2} step={0.05} value={animation.entryDelay}
          onChange={(e) => updateAnimation({ entryDelay: parseFloat(e.target.value) })} style={sliderStyle} />
      </Campo>

      {/* Custom entry properties */}
      {animation.entryPreset === 'custom' && (
        <details open style={{ paddingTop: 2 }}>
          <summary style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--color-accent)',
            cursor: 'pointer', userSelect: 'none', listStyle: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
            paddingBottom: 10, paddingTop: 4,
          }}>
            <GripVertical size={11} /> Propriedades de entrada (custom)
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <Row2>
              <Campo label="X offset" valor={`${animation.entryX}px`}>
                <input type="range" min={-300} max={300} step={1} value={animation.entryX}
                  onChange={(e) => updateAnimation({ entryX: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Y offset" valor={`${animation.entryY}px`}>
                <input type="range" min={-300} max={300} step={1} value={animation.entryY}
                  onChange={(e) => updateAnimation({ entryY: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Row2>
              <Campo label="Escala" valor={animation.entryScale}>
                <input type="range" min={0} max={3} step={0.05} value={animation.entryScale}
                  onChange={(e) => updateAnimation({ entryScale: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Rotação" valor={`${animation.entryRotation}°`}>
                <input type="range" min={-180} max={180} step={1} value={animation.entryRotation}
                  onChange={(e) => updateAnimation({ entryRotation: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Row2>
              <Campo label="Blur" valor={`${animation.entryBlur}px`}>
                <input type="range" min={0} max={50} step={1} value={animation.entryBlur}
                  onChange={(e) => updateAnimation({ entryBlur: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Opacidade" valor={animation.entryOpacity}>
                <input type="range" min={0} max={1} step={0.05} value={animation.entryOpacity}
                  onChange={(e) => updateAnimation({ entryOpacity: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Row2>
              <Campo label="SkewX" valor={`${animation.entrySkewX}°`}>
                <input type="range" min={-45} max={45} step={1} value={animation.entrySkewX}
                  onChange={(e) => updateAnimation({ entrySkewX: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="SkewY" valor={`${animation.entrySkewY}°`}>
                <input type="range" min={-45} max={45} step={1} value={animation.entrySkewY}
                  onChange={(e) => updateAnimation({ entrySkewY: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
          </div>
        </details>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '6px 0' }} />

      {/* Exit */}
      <Row2>
        <Campo label="Preset de saída" dica="Estilo pré-configurado de como o texto sai da tela.">
          <select value={animation.exitPreset} onChange={(e) => updateAnimation({ exitPreset: e.target.value as ExitPreset })} style={selectStyle}>
            {(Object.keys(EXIT_PRESET_LABELS) as ExitPreset[]).map(k => (
              <option key={k} value={k}>{EXIT_PRESET_LABELS[k]}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Duração saída" valor={`${animation.exitDuration}s`}>
          <input type="range" min={0.1} max={3.0} step={0.05} value={animation.exitDuration}
            onChange={(e) => updateAnimation({ exitDuration: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
      </Row2>

      <Row2>
        <Campo label="Cascata saída" valor={`${animation.exitStagger}s`}>
          <input type="range" min={0.0} max={0.3} step={0.005} value={animation.exitStagger}
            onChange={(e) => updateAnimation({ exitStagger: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
        <Campo label="Curva saída">
          <select value={animation.exitEase} onChange={(e) => updateAnimation({ exitEase: e.target.value })} style={selectStyle}>
            {easingKeys.map(k => <option key={k} value={k}>{nomesCurvas[k] || k}</option>)}
          </select>
        </Campo>
      </Row2>

      {/* Custom exit properties */}
      {animation.exitPreset === 'custom' && (
        <details open style={{ paddingTop: 2 }}>
          <summary style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--color-accent)',
            cursor: 'pointer', userSelect: 'none', listStyle: 'none',
            display: 'flex', alignItems: 'center', gap: 6,
            paddingBottom: 10, paddingTop: 4,
          }}>
            <GripVertical size={11} /> Propriedades de saída (custom)
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
            <Row2>
              <Campo label="X" valor={`${animation.exitX}px`}>
                <input type="range" min={-300} max={300} step={1} value={animation.exitX}
                  onChange={(e) => updateAnimation({ exitX: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Y" valor={`${animation.exitY}px`}>
                <input type="range" min={-300} max={300} step={1} value={animation.exitY}
                  onChange={(e) => updateAnimation({ exitY: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Row2>
              <Campo label="Escala" valor={animation.exitScale}>
                <input type="range" min={0} max={3} step={0.05} value={animation.exitScale}
                  onChange={(e) => updateAnimation({ exitScale: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Rotação" valor={`${animation.exitRotation}°`}>
                <input type="range" min={-180} max={180} step={1} value={animation.exitRotation}
                  onChange={(e) => updateAnimation({ exitRotation: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Row2>
              <Campo label="Blur" valor={`${animation.exitBlur}px`}>
                <input type="range" min={0} max={50} step={1} value={animation.exitBlur}
                  onChange={(e) => updateAnimation({ exitBlur: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Opacidade" valor={animation.exitOpacity}>
                <input type="range" min={0} max={1} step={0.05} value={animation.exitOpacity}
                  onChange={(e) => updateAnimation({ exitOpacity: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
            <Row2>
              <Campo label="SkewX" valor={`${animation.exitSkewX}°`}>
                <input type="range" min={-45} max={45} step={1} value={animation.exitSkewX}
                  onChange={(e) => updateAnimation({ exitSkewX: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="SkewY" valor={`${animation.exitSkewY}°`}>
                <input type="range" min={-45} max={45} step={1} value={animation.exitSkewY}
                  onChange={(e) => updateAnimation({ exitSkewY: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>
          </div>
        </details>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '6px 0' }} />

      {/* Idle motion */}
      <Row2>
        <Campo label="Movimento idle" dica="Movimento contínuo enquanto o texto está visível.">
          <select value={animation.idleMotion} onChange={(e) => updateAnimation({ idleMotion: e.target.value as IdleMotionType })} style={selectStyle}>
            {(Object.keys(IDLE_LABELS) as IdleMotionType[]).map(k => (
              <option key={k} value={k}>{IDLE_LABELS[k]}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Velocidade" valor={`${animation.idleSpeed}×`}>
          <input type="range" min={0.1} max={5.0} step={0.1} value={animation.idleSpeed}
            onChange={(e) => updateAnimation({ idleSpeed: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
      </Row2>
      {animation.idleMotion !== 'none' && (
        <Campo label="Intensidade" valor={`${animation.idleIntensity}×`} dica="Amplitude do movimento idle.">
          <input type="range" min={0.1} max={5.0} step={0.1} value={animation.idleIntensity}
            onChange={(e) => updateAnimation({ idleIntensity: parseFloat(e.target.value) })} style={sliderStyle} />
        </Campo>
      )}
    </>
  )
}

// ─── Layout Mode Labels ──────────────────────────────────────────────────────

const LAYOUT_LABELS: Record<TypographyLayoutMode, string> = {
  center: '⊕ Centralizado',
  stack: '▤ Empilhado',
  sideBySide: '▥ Lado a lado',
  diagonal: '⟋ Diagonal',
  overlap: '▧ Sobreposição',
  freeform: '✦ Livre (arrastar)',
};

// ─── Main Panel ──────────────────────────────────────────────────────────────

export function TypographyPanel() {
  const {
    motionConfig,
    updateTypography, updateTrail,
    updateTitleLayer, updateSubtitleLayer,
    updateTitleAnimation, updateSubtitleAnimation,
    updateTitleTransform, updateSubtitleTransform,
    setLayoutMode, toggleLinkPosition, toggleLinkAnimation,
    availableFonts, fetchLocalFonts,
  } = useEditorStore();

  const { titleLayer, subtitleLayer, layoutMode, layoutGap, timeOnScreen, linkPosition, linkAnimation } = motionConfig.typography;

  const {
    enabled: trailEnabled,
    instances, staggerDelay, mainEntryDelay, blendMode,
    opacityDecay, scaleDecay, blurIncrement, style,
    trailColor, trailMode,
    trailLetterSpacing, trailOffsetY, trailOffsetX,
    trailScaleMultiplier, trailRotation,
  } = motionConfig.trail;

  const easingKeys = Object.keys(motionConfig.easing);
  const nomesCurvas: Record<string, string> = {
    entrySmooth: 'Suave (recomendado)',
    exitSharp: 'Cortante',
    elastic: 'Elástico',
    bounceOut: 'Ricochete',
    microInteraction: 'Sutil',
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflowY: 'auto', paddingRight: 4 }}
      className="custom-scrollbar"
    >

      {/* ─── LAYOUT ───────────────────────────────────────────────────── */}
      <Section icon={<Layout size={13} color="var(--color-accent)" />} title="Layout" defaultOpen>
        <Campo label="Modo de layout" dica="Como título e subtítulo são posicionados. 'Livre' permite arrastar com o mouse.">
          <select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value as TypographyLayoutMode)} style={selectStyle}>
            {(Object.keys(LAYOUT_LABELS) as TypographyLayoutMode[]).map(k => (
              <option key={k} value={k}>{LAYOUT_LABELS[k]}</option>
            ))}
          </select>
        </Campo>

        <Row2>
          <Campo label="Espaçamento" valor={`${layoutGap}px`} dica="Distância entre título e subtítulo.">
            <input type="range" min={0} max={100} step={2} value={layoutGap}
              onChange={(e) => updateTypography({ layoutGap: parseInt(e.target.value) })} style={sliderStyle} />
          </Campo>
          <Campo label="Tempo em tela" valor={`${timeOnScreen}s`} dica="Quanto tempo o texto fica visível antes de sair.">
            <input type="range" min={0.0} max={5.0} step={0.1} value={timeOnScreen}
              onChange={(e) => updateTypography({ timeOnScreen: parseFloat(e.target.value) })} style={sliderStyle} />
          </Campo>
        </Row2>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleLinkPosition}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: linkPosition ? 'rgba(0,212,255,0.1)' : 'var(--color-bg-elevated)',
              border: `1px solid ${linkPosition ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
              borderRadius: 'var(--radius-sm)', padding: '8px',
              color: linkPosition ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {linkPosition ? <Link2 size={12} /> : <Unlink2 size={12} />}
            Link Posição
          </button>
          <button
            onClick={toggleLinkAnimation}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: linkAnimation ? 'rgba(0,212,255,0.1)' : 'var(--color-bg-elevated)',
              border: `1px solid ${linkAnimation ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
              borderRadius: 'var(--radius-sm)', padding: '8px',
              color: linkAnimation ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {linkAnimation ? <Link2 size={12} /> : <Unlink2 size={12} />}
            Link Animação
          </button>
        </div>
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── TÍTULO ───────────────────────────────────────────────────── */}
      <Section
        icon={<Heading1 size={13} color="var(--color-accent)" />}
        title="Título"
        badge={titleLayer.enabled ? 'ON' : 'OFF'}
        defaultOpen
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <ToggleButton
            active={titleLayer.enabled}
            onClick={() => updateTitleLayer({ enabled: !titleLayer.enabled })}
            label={titleLayer.enabled ? 'Visível' : 'Oculto'}
          />
        </div>
        {titleLayer.enabled && (
          <LayerSection
            layer={titleLayer}
            updateLayer={updateTitleLayer}
            updateTransform={updateTitleTransform}
            availableFonts={availableFonts}
            fetchLocalFonts={fetchLocalFonts}
          />
        )}
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── SUBTÍTULO ────────────────────────────────────────────────── */}
      <Section
        icon={<AlignLeft size={13} color="var(--color-accent)" />}
        title="Subtítulo"
        badge={subtitleLayer.enabled ? 'ON' : 'OFF'}
        defaultOpen={false}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <ToggleButton
            active={subtitleLayer.enabled}
            onClick={() => updateSubtitleLayer({ enabled: !subtitleLayer.enabled })}
            label={subtitleLayer.enabled ? 'Visível' : 'Oculto'}
          />
        </div>
        {subtitleLayer.enabled && (
          <LayerSection
            layer={subtitleLayer}
            updateLayer={updateSubtitleLayer}
            updateTransform={updateSubtitleTransform}
            availableFonts={availableFonts}
            fetchLocalFonts={fetchLocalFonts}
          />
        )}
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── ANIMAÇÃO DO TÍTULO ───────────────────────────────────────── */}
      <Section icon={<Sparkles size={13} color="var(--color-accent)" />} title="Animação — Título" defaultOpen>
        <AnimationSection
          animation={titleLayer.animation}
          updateAnimation={updateTitleAnimation}
          easingKeys={easingKeys}
          nomesCurvas={nomesCurvas}
          linked={false}
        />
      </Section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />

      {/* ─── ANIMAÇÃO DO SUBTÍTULO ────────────────────────────────────── */}
      {subtitleLayer.enabled && (
        <>
          <Section icon={<Sparkles size={13} color={linkAnimation ? 'var(--color-text-secondary)' : 'var(--color-accent)'} />} title="Animação — Subtítulo" defaultOpen={false}>
            <AnimationSection
              animation={subtitleLayer.animation}
              updateAnimation={updateSubtitleAnimation}
              easingKeys={easingKeys}
              nomesCurvas={nomesCurvas}
              linked={linkAnimation}
            />
          </Section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />
        </>
      )}

      {/* ─── ECO & BRILHO ─────────────────────────────────────────────── */}
      <Section
        icon={<Sparkles size={13} color={trailEnabled ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />}
        title="Eco & Brilho"
        badge={trailEnabled ? 'ATIVO' : 'OFF'}
        defaultOpen={false}
      >
        {/* Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Efeito de eco
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>
              Cópias brilhantes atrás do título
            </span>
          </div>
          <ToggleButton
            active={trailEnabled}
            onClick={() => updateTrail({ enabled: !trailEnabled })}
            label={trailEnabled ? 'Ativado' : 'Desativado'}
          />
        </div>

        {trailEnabled && (
          <>
            <Row2>
              <Campo label="Visual do eco" dica="Aparência do eco.">
                <select value={style} onChange={(e) => updateTrail({ style: e.target.value as any })} style={selectStyle}>
                  <option value="solid">Sólido</option>
                  <option value="stroke">Contorno</option>
                  <option value="blur">Brilho</option>
                  <option value="chromatic">Cromático</option>
                </select>
              </Campo>
              <Campo label="Comportamento" dica="Quando o eco é visível.">
                <select value={trailMode} onChange={(e) => updateTrail({ trailMode: e.target.value as any })} style={selectStyle}>
                  <option value="persistent">Sempre visível</option>
                  <option value="leading">Entra primeiro</option>
                </select>
              </Campo>
            </Row2>

            <Row2>
              <Campo label="Cor do eco">
                <input
                  type="color" value={trailColor || '#a78bfa'}
                  onChange={(e) => updateTrail({ trailColor: e.target.value })}
                  style={{ width: '100%', height: 34, padding: 0, border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}
                />
              </Campo>
              <Campo label="Mistura">
                <select value={blendMode} onChange={(e) => updateTrail({ blendMode: e.target.value })} style={selectStyle}>
                  <option value="normal">Normal</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="lighten">Clarear</option>
                  <option value="color-dodge">Dodge</option>
                  <option value="difference">Diferença</option>
                </select>
              </Campo>
            </Row2>

            <Row2>
              <Campo label="Camadas" valor={instances}>
                <input type="range" min={1} max={12} step={1} value={instances}
                  onChange={(e) => updateTrail({ instances: parseInt(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Transparência" valor={opacityDecay}>
                <input type="range" min={0.0} max={0.5} step={0.01} value={opacityDecay}
                  onChange={(e) => updateTrail({ opacityDecay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>

            <Row2>
              <Campo label="Encolher" valor={scaleDecay}>
                <input type="range" min={0.0} max={0.08} step={0.002} value={scaleDecay}
                  onChange={(e) => updateTrail({ scaleDecay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Desfoque" valor={`${blurIncrement}px`}>
                <input type="range" min={0.0} max={4.0} step={0.1} value={blurIncrement}
                  onChange={(e) => updateTrail({ blurIncrement: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>

            <Row2>
              <Campo label="Intervalo" valor={`${staggerDelay}s`}>
                <input type="range" min={0.01} max={0.3} step={0.005} value={staggerDelay}
                  onChange={(e) => updateTrail({ staggerDelay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Atraso principal" valor={`${mainEntryDelay}s`}>
                <input type="range" min={0.0} max={1.0} step={0.05} value={mainEntryDelay}
                  onChange={(e) => updateTrail({ mainEntryDelay: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>

            <details style={{ paddingTop: 2 }}>
              <summary style={{
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: 'var(--color-text-secondary)',
                cursor: 'pointer', userSelect: 'none', listStyle: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
                paddingBottom: 10, paddingTop: 4,
              }}>
                <ChevronDown size={11} /> Posição e forma do eco
              </summary>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                <Row2>
                  <Campo label="Espaço extra" valor={`${trailLetterSpacing ?? 0}em`}>
                    <input type="range" min={-0.2} max={0.5} step={0.01} value={trailLetterSpacing ?? 0}
                      onChange={(e) => updateTrail({ trailLetterSpacing: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Escala ×" valor={trailScaleMultiplier ?? 1}>
                    <input type="range" min={0.8} max={1.3} step={0.01} value={trailScaleMultiplier ?? 1}
                      onChange={(e) => updateTrail({ trailScaleMultiplier: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                </Row2>
                <Row2>
                  <Campo label="Offset X" valor={`${trailOffsetX ?? 0}px`}>
                    <input type="range" min={-60} max={60} step={1} value={trailOffsetX ?? 0}
                      onChange={(e) => updateTrail({ trailOffsetX: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Offset Y" valor={`${trailOffsetY ?? 0}px`}>
                    <input type="range" min={-60} max={60} step={1} value={trailOffsetY ?? 0}
                      onChange={(e) => updateTrail({ trailOffsetY: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                </Row2>
                <Campo label="Rotação" valor={`${trailRotation ?? 0}°`}>
                  <input type="range" min={-45} max={45} step={0.5} value={trailRotation ?? 0}
                    onChange={(e) => updateTrail({ trailRotation: parseFloat(e.target.value) })} style={sliderStyle} />
                </Campo>
              </div>
            </details>
          </>
        )}
      </Section>

      <div style={{ height: 40 }} />
    </div>
  )
}
