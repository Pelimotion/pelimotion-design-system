import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/useEditorStore'
import type {
  TypographyLayer,
  TypoLayerAnimation,
  TypoLayerTransform,
  EntryPreset,
  ExitPreset,
  SplitMode,
  StaggerFrom,
  IdleMotionType,
} from '@/types/motion.types'
import {
  Sparkles, ChevronDown, ChevronRight,
  Info, Eye, EyeOff, Layout, Link2, Unlink2,
  Heading1, Move,
  GripVertical, Layers, Play, Wand2, Palette, Upload
} from 'lucide-react'
import { SubTabBar } from '@/components/SubTabBar'
import { TYPOGRAPHY_PRESETS } from '@/config/typography-presets'
import { ColorManager } from '@/components/ColorManager'

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

  const [localText, setLocalText] = useState(layer.text);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const fontName = (file.name.split('.')[0] || 'CustomFont').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
      const fontFace = new FontFace(fontName, buffer);
      
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
        useEditorStore.setState((state) => ({ availableFonts: [...new Set([...state.availableFonts, fontName])] }));
        updateLayer({ fontFamily: fontName });
      }).catch(err => console.error("Erro ao carregar fonte:", err));
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (localText !== layer.text) {
      setLocalText(layer.text);
    }
  }, [layer.text]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (localText !== layer.text) {
        updateLayer({ text: localText });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [localText]);

  return (
    <>
      {/* Text input */}
      <Campo label="Texto" dica="O conteúdo de texto desta camada.">
        <textarea
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
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
      <Campo label="Fonte" dica="Família tipográfica. Faça upload ou carregue do sistema.">
        <div style={{ display: 'flex', gap: 6 }}>
          <select value={layer.fontFamily} onChange={(e) => updateLayer({ fontFamily: e.target.value })} style={selectStyle}>
            {todasFontes.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button
            onClick={() => fontInputRef.current?.click()}
            title="Upload Fonte (.ttf, .otf)"
            style={{
              flexShrink: 0, fontSize: '0.65rem',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)', cursor: 'pointer',
              padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <Upload size={10} />
          </button>
          <input 
            type="file" ref={fontInputRef} onChange={handleFontUpload} 
            accept=".ttf,.otf,.woff,.woff2" style={{ display: 'none' }} 
          />
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
  fadeUp: 'Surgir Cima',
  fadeDown: 'Surgir Baixo',
  slideLeft: 'Deslizar Esq.',
  slideRight: 'Deslizar Dir.',
  scaleIn: 'Aumentar',
  rotateIn: 'Girar',
  blurIn: 'Focar',
  typewriter: 'Máquina de Escrever',
  elastic: 'Elástico',
  glitch: 'Glitch Digital',
  reveal: 'Revelação Vertical',
  splitFlip: 'Flip 3D (Letras)',
  custom: 'Personalizado',
  brutalSlam: 'Brutal Slam',
  blurStretch: 'Blur Stretch',
  elegantWipe: 'Elegant Wipe',
  kineticChop: 'Kinetic Chop',
  bounceIn: 'Quicar Entrada',
  elasticWhip: 'Chicote Elástico'
};

const EXIT_PRESET_LABELS: Record<ExitPreset, string> = {
  fadeUp: 'Sobe Suave',
  fadeDown: 'Desce Suave',
  slideLeft: 'Desliza Esq.',
  slideRight: 'Desliza Dir.',
  scaleOut: 'Zoom Externo',
  rotateOut: 'Rotaciona Saindo',
  blurOut: 'Desfoque',
  dissolve: 'Dissolve',
  reveal: 'Wipe Out Vertical',
  custom: 'Personalizado',
  brutalSlam: 'Brutal Slam',
  blurStretch: 'Blur Stretch',
  elegantWipe: 'Elegant Wipe',
  kineticChop: 'Kinetic Chop',
  bounceOut: 'Quicar Saída',
  elasticSnap: 'Estalo Elástico'
};

const SPLIT_MODE_LABELS: Record<SplitMode, string> = {
  chars: 'Letra a letra',
  words: 'Palavra a palavra',
  lines: 'Linha inteira',
  none: 'Bloco único',
};

const STAGGER_FROM_LABELS: Record<StaggerFrom, string> = {
  start: 'Do Início',
  end: 'Do Fim',
  center: 'Do Centro',
  edges: 'Das Bordas',
  random: 'Aleatório',
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


// ─── Main Panel ──────────────────────────────────────────────────────────────

export function TypographyPanel() {
  const {
    motionConfig,
    updateTypography, updateTrail,
    addTypoLayer, removeTypoLayer, updateTypoLayer,
    updateTypoLayerAnimation, updateTypoLayerTransform,
    toggleLinkAnimation,
    incrementAnimKey,
    availableFonts, fetchLocalFonts,
    activeTypoLayerId, setActiveTypoLayer,
    loadTypographyPreset,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState('camadas');
  const panelRef = useRef<HTMLDivElement>(null);

  const { layers, layoutGap, timeOnScreen, linkAnimation } = motionConfig.typography;
  const globalTrail = motionConfig.trail;

  const activeLayer = layers.find(l => l.id === activeTypoLayerId) || layers[0];

  const easingKeys = Object.keys(motionConfig.easing);
  const nomesCurvas: Record<string, string> = {
    entrySmooth: 'Suave (recomendado)',
    exitSharp: 'Cortante',
    elastic: 'Elástico',
    bounceOut: 'Ricochete',
    microInteraction: 'Sutil',
  };

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab, activeTypoLayerId]);

  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    const defaultAnim = layers[0]?.animation || {
      entryPreset: 'fadeUp', entryDuration: 1, entryStagger: 0.02, entryEase: 'entrySmooth', entryDelay: 0,
      splitMode: 'chars', staggerFrom: 'start', exitPreset: 'fadeUp', exitDuration: 0.5, exitStagger: 0.01,
      exitEase: 'exitSharp', exitDelay: 0, idleMotion: 'none', idleSpeed: 1, idleIntensity: 1,
      entryX: 0, entryY: 50, entryScale: 0.9, entryRotation: 0, entryBlur: 10, entryOpacity: 0, entrySkewX: 0, entrySkewY: 0,
      exitX: 0, exitY: -50, exitScale: 1.1, exitRotation: 0, exitBlur: 10, exitOpacity: 0, exitSkewX: 0, exitSkewY: 0
    };

    addTypoLayer({
      id: newId,
      name: `Texto ${layers.length + 1}`,
      enabled: true,
      text: 'Novo Texto',
      fontFamily: 'Inter',
      fontWeight: 700,
      fontSize: 3,
      letterSpacing: 0,
      lineHeight: 1.1,
      textTransform: 'none',
      fontStyle: 'normal',
      color: '#ffffff',
      textAlign: 'center',
      maxWidth: 80,
      transform: { x: 0, y: 50, scale: 1, rotation: 0, opacity: 1 },
      animation: { ...defaultAnim as any }
    });
  };

  if (!activeLayer) return null;

  // Trail config is now specific to the active layer, or falls back to global
  const trailConf = activeLayer.trail || globalTrail;
  const trailEnabled = trailConf.enabled;

  return (
    <div
      ref={panelRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflowY: 'auto', paddingRight: 4 }}
      className="custom-scrollbar"
    >
      <SubTabBar
        tabs={[
          { id: 'camadas', label: 'Camadas', icon: <Layers /> },
          { id: 'animacao', label: 'Animação', icon: <Play /> },
          { id: 'efeitos', label: 'Efeitos', icon: <Wand2 /> },
          { id: 'cores', label: 'Cores', icon: <Palette /> }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Ações Rápidas de Workflow */}
      <div style={{ padding: '0 4px', marginBottom: 8, marginTop: 8, display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => {
            const assetId = `typo-temp-${Date.now()}`;
            const item = {
              id: assetId,
              name: `Texto: ${layers.map(l => l.text).join(' ').slice(0, 15) || 'Sem título'}`,
              type: 'typography',
              createdAt: Date.now(),
              data: {
                layers,
                layoutGap,
                timeOnScreen,
                linkAnimation,
                trail: globalTrail
              }
            };
            // 1. Salva na biblioteca local temporária da sessão
            useEditorStore.getState().saveToLocalLibrary(item);
            // 2. Adiciona como camada de composição
            useEditorStore.getState().addCompositionLayer({
              id: crypto.randomUUID(),
              name: item.name,
              type: 'localAsset',
              assetId,
              startTime: 0,
              duration: timeOnScreen || 5,
              transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
            });
            // 3. Muda para o painel de composição
            useEditorStore.getState().setActivePanel('composition');
          }}
          style={{
            flex: 1,
            padding: '8px',
            background: 'var(--color-accent)',
            color: '#0a0a0f',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
        >
          <Play size={14} style={{ color: '#0a0a0f' }} />
          Usar na Composição
        </button>

        <button
          onClick={() => {
            const item = {
              id: `typo-${Date.now()}`,
              name: `Design: Texto ${Date.now().toString().slice(-4)}`,
              type: 'typography',
              createdAt: Date.now(),
              data: {
                layers,
                layoutGap,
                timeOnScreen,
                linkAnimation,
                trail: globalTrail
              }
            };
            useEditorStore.getState().saveToLocalLibrary(item);
          }}
          style={{
            flex: 1,
            padding: '8px',
            background: 'var(--color-surface-glass)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-surface-border)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
        >
          <Layers size={14} />
          Salvar Biblioteca
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginTop: 4, flexShrink: 0 }} className="custom-scrollbar">
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => setActiveTypoLayer(layer.id)}
            style={{
              padding: '6px 12px', borderRadius: 99,
              fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
              background: activeLayer.id === layer.id ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              color: activeLayer.id === layer.id ? '#0a0a0f' : 'var(--color-text-secondary)',
              border: `1px solid ${activeLayer.id === layer.id ? 'var(--color-accent)' : 'var(--color-surface-border)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {layer.name}
          </button>
        ))}
        <button
          onClick={handleAddLayer}
          style={{
            padding: '6px 12px', borderRadius: 99,
            fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px dashed var(--color-surface-border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Add
        </button>
      </div>

      {activeTab === 'exemplos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 2px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Escolha um preset criativo para substituir a diagramação atual.
          </div>
          {TYPOGRAPHY_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => loadTypographyPreset(preset.config)}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-surface-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-surface-border)'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {preset.name}
                </span>
                <span style={{ 
                  fontSize: '0.6rem', 
                  padding: '2px 6px', 
                  borderRadius: 99, 
                  background: 'var(--color-surface-hover)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {preset.density}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {preset.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'camadas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* ─── LAYOUT GLOBAL ─────────────────────────────────────────── */}
          <Section icon={<Layout size={13} color="var(--color-accent)" />} title="Layout Global" defaultOpen={false}>
            <Row2>
              <Campo label="Espaçamento" valor={`${layoutGap}px`} dica="Distância entre camadas nos modos empilhado/lado-a-lado.">
                <input type="range" min={0} max={100} step={2} value={layoutGap}
                  onChange={(e) => updateTypography({ layoutGap: parseInt(e.target.value) })} style={sliderStyle} />
              </Campo>
              <Campo label="Tempo em tela" valor={`${timeOnScreen}s`} dica="Quanto tempo o texto fica visível antes de sair.">
                <input type="range" min={0.0} max={5.0} step={0.1} value={timeOnScreen}
                  onChange={(e) => updateTypography({ timeOnScreen: parseFloat(e.target.value) })} style={sliderStyle} />
              </Campo>
            </Row2>

            <Campo label="Movimento IDLE Global" dica="Animação contínua aplicada a todas as camadas simultaneamente.">
              <select value={motionConfig.typography.globalIdleMotion || 'none'} onChange={(e) => updateTypography({ globalIdleMotion: e.target.value as any })} style={selectStyle}>
                {(Object.keys(IDLE_LABELS) as any[]).map(k => (
                  <option key={k} value={k}>{IDLE_LABELS[k as keyof typeof IDLE_LABELS]}</option>
                ))}
              </select>
            </Campo>

            <div style={{ display: 'flex', gap: 8 }}>
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
                Sincronizar Animações
              </button>

              <button
                onClick={incrementAnimKey}
                title="Força a recriação completa da timeline de animação (útil após editar texto)"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-surface-border)',
                  borderRadius: 'var(--radius-sm)', padding: '8px',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-surface-border)'; }}
              >
                ↺ Reiniciar Efeito
              </button>
            </div>
          </Section>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-surface-border)', margin: '4px 0' }} />


          {/* ─── CAMADA ATIVA ───────────────────────────────────────────── */}
          <Section
            icon={<Heading1 size={13} color="var(--color-accent)" />}
            title={`Camada: ${activeLayer.name}`}
            badge={activeLayer.enabled ? 'ON' : 'OFF'}
            defaultOpen
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              {layers.length > 1 ? (
                <button
                  onClick={() => removeTypoLayer(activeLayer.id)}
                  style={{
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer'
                  }}
                >
                  Excluir Camada
                </button>
              ) : <div />}
              <ToggleButton
                active={activeLayer.enabled}
                onClick={() => updateTypoLayer(activeLayer.id, { enabled: !activeLayer.enabled })}
                label={activeLayer.enabled ? 'Visível' : 'Oculto'}
              />
            </div>
            
            <Campo label="Nome da camada">
              <input
                type="text"
                value={activeLayer.name}
                onChange={(e) => updateTypoLayer(activeLayer.id, { name: e.target.value })}
                style={{
                  width: '100%', background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-surface-border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)',
                  padding: '6px 10px', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </Campo>

            {activeLayer.enabled && (
              <LayerSection
                layer={activeLayer}
                updateLayer={(patch) => updateTypoLayer(activeLayer.id, patch)}
                updateTransform={(patch) => updateTypoLayerTransform(activeLayer.id, patch)}
                availableFonts={availableFonts}
                fetchLocalFonts={fetchLocalFonts}
              />
            )}
          </Section>
        </div>
      )}

      {activeTab === 'animacao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* ─── ANIMAÇÃO DA CAMADA ATIVA ─────────────────────────────────── */}
          <Section icon={<Sparkles size={13} color="var(--color-accent)" />} title={`Animação: ${activeLayer.name}`} defaultOpen>
            {activeLayer.enabled ? (
              <AnimationSection
                animation={activeLayer.animation}
                updateAnimation={(patch) => updateTypoLayerAnimation(activeLayer.id, patch)}
                easingKeys={easingKeys}
                nomesCurvas={nomesCurvas}
                linked={false}
              />
            ) : (
              <div style={{ color: 'var(--color-text-ghost)', fontSize: '0.8rem', textAlign: 'center', padding: '16px' }}>
                Ative a camada para editar a animação.
              </div>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'efeitos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* ─── ECO & BRILHO (POR CAMADA) ────────────────────────────────── */}
          <Section
            icon={<Sparkles size={13} color={trailEnabled ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />}
            title={`Eco & Brilho: ${activeLayer.name}`}
            badge={trailEnabled ? 'ATIVO' : 'OFF'}
            defaultOpen
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
                  Aplica-se apenas a esta camada
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
                    <select value={trailConf.style} onChange={(e) => updateTrail({ style: e.target.value as any })} style={selectStyle}>
                      <option value="solid">Sólido</option>
                      <option value="stroke">Contorno</option>
                      <option value="blur">Brilho</option>
                      <option value="chromatic">Cromático</option>
                    </select>
                  </Campo>
                  <Campo label="Comportamento" dica="Quando o eco é visível.">
                    <select value={trailConf.trailMode} onChange={(e) => updateTrail({ trailMode: e.target.value as any })} style={selectStyle}>
                      <option value="persistent">Sempre visível</option>
                      <option value="leading">Entra primeiro</option>
                    </select>
                  </Campo>
                </Row2>

                <Row2>
                  <Campo label="Cor do eco">
                    <input
                      type="color" value={trailConf.trailColor || '#a78bfa'}
                      onChange={(e) => updateTrail({ trailColor: e.target.value })}
                      style={{ width: '100%', height: 34, padding: 0, border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}
                    />
                  </Campo>
                  <Campo label="Mistura">
                    <select value={trailConf.blendMode} onChange={(e) => updateTrail({ blendMode: e.target.value })} style={selectStyle}>
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
                  <Campo label="Camadas" valor={trailConf.instances}>
                    <input type="range" min={1} max={12} step={1} value={trailConf.instances}
                      onChange={(e) => updateTrail({ instances: parseInt(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Transparência" valor={trailConf.opacityDecay}>
                    <input type="range" min={0.0} max={0.5} step={0.01} value={trailConf.opacityDecay}
                      onChange={(e) => updateTrail({ opacityDecay: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                </Row2>

                <Row2>
                  <Campo label="Encolher" valor={trailConf.scaleDecay}>
                    <input type="range" min={0.0} max={0.08} step={0.002} value={trailConf.scaleDecay}
                      onChange={(e) => updateTrail({ scaleDecay: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <div />
                </Row2>

                <Row2>
                  <Campo label="Intervalo" valor={`${trailConf.staggerDelay}s`}>
                    <input type="range" min={0.01} max={0.3} step={0.005} value={trailConf.staggerDelay}
                      onChange={(e) => updateTrail({ staggerDelay: parseFloat(e.target.value) })} style={sliderStyle} />
                  </Campo>
                  <Campo label="Atraso principal" valor={`${trailConf.mainEntryDelay}s`}>
                    <input type="range" min={0.0} max={1.0} step={0.05} value={trailConf.mainEntryDelay}
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
                      <Campo label="Espaço extra" valor={`${trailConf.trailLetterSpacing ?? 0}em`}>
                        <input type="range" min={-0.2} max={0.5} step={0.01} value={trailConf.trailLetterSpacing ?? 0}
                          onChange={(e) => updateTrail({ trailLetterSpacing: parseFloat(e.target.value) })} style={sliderStyle} />
                      </Campo>
                      <Campo label="Escala ×" valor={trailConf.trailScaleMultiplier ?? 1}>
                        <input type="range" min={0.8} max={1.3} step={0.01} value={trailConf.trailScaleMultiplier ?? 1}
                          onChange={(e) => updateTrail({ trailScaleMultiplier: parseFloat(e.target.value) })} style={sliderStyle} />
                      </Campo>
                    </Row2>
                    <Row2>
                      <Campo label="Offset X" valor={`${trailConf.trailOffsetX ?? 0}px`}>
                        <input type="range" min={-60} max={60} step={1} value={trailConf.trailOffsetX ?? 0}
                          onChange={(e) => updateTrail({ trailOffsetX: parseFloat(e.target.value) })} style={sliderStyle} />
                      </Campo>
                      <Campo label="Offset Y" valor={`${trailConf.trailOffsetY ?? 0}px`}>
                        <input type="range" min={-60} max={60} step={1} value={trailConf.trailOffsetY ?? 0}
                          onChange={(e) => updateTrail({ trailOffsetY: parseFloat(e.target.value) })} style={sliderStyle} />
                      </Campo>
                    </Row2>
                    <Campo label="Rotação" valor={`${trailConf.trailRotation ?? 0}°`}>
                      <input type="range" min={-45} max={45} step={0.5} value={trailConf.trailRotation ?? 0}
                        onChange={(e) => updateTrail({ trailRotation: parseFloat(e.target.value) })} style={sliderStyle} />
                    </Campo>
                  </div>
                </details>
              </>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'cores' && (
        <ColorManager />
      )}

      <div style={{ height: 40 }} />
    </div>
  )
}
