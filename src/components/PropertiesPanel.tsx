/**
 * PropertiesPanel — Pelimotion v3.0
 *
 * Contextual properties inspector (right panel, Figma-style).
 * Shows properties of the selected universal layer.
 * Uses progressive disclosure: basic props visible, advanced in collapsed section.
 */
import React, { useState, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { UniversalLayer, TextLayerData, ElementLayerData, OverlayLayerData, ShadowGuardLayerData, TextBoxLayerData, AnimationEntryPreset, AnimationExitPreset, AutoAnimatePreset } from '@/types/universalLayers.types';
import type { AudioTrack } from '@/types/motion.types';
import {
  ChevronDown, ChevronRight, Zap, Type, Layers, Settings2, Palette, Move,
  Sparkles, RotateCcw, AlignLeft, AlignCenter, AlignRight, Square, Upload, Music,
} from 'lucide-react';

// ─── Shared Sub-components ──────────────────────────────────────────────────

function SectionHeader({ title, icon, defaultOpen = true, children }: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '7px 0', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--color-text-muted)', textAlign: 'left',
          borderBottom: '1px solid var(--color-surface-border)',
        }}
      >
        <span style={{ color: 'var(--color-text-ghost)', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
          {title}
        </span>
        <span style={{ color: 'var(--color-text-ghost)', display: 'flex', transition: 'transform 0.15s ease', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown size={12} />
        </span>
      </button>
      {open && <div style={{ paddingTop: 10 }}>{children}</div>}
    </div>
  );
}

function AdvancedSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-ghost)', fontSize: '0.65rem',
          fontFamily: 'var(--font-sans)', padding: '4px 0',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-ghost)'}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        Opções avançadas
      </button>
      {open && (
        <div style={{
          marginTop: 8, padding: 10,
          background: 'hsla(0,0%,100%,0.02)',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 8,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PropRow({ label, children, tooltip }: { label: string; children: React.ReactNode; tooltip?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <label
        title={tooltip}
        style={{
          fontSize: '0.68rem', color: 'var(--color-text-ghost)',
          width: 80, flexShrink: 0, cursor: tooltip ? 'help' : 'default',
          textDecoration: tooltip ? 'underline dotted' : 'none',
          textUnderlineOffset: 2,
        }}
      >
        {label}
      </label>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function NumInput({ value, onChange, min, max, step = 0.1, unit }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string;
}) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'hsla(0,0%,100%,0.05)', borderRadius: 6, border: '1px solid var(--color-surface-border)', overflow: 'hidden' }}>
      <input
        type="number"
        value={parseFloat(safeValue.toFixed(2))}
        onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
        min={min} max={max} step={step}
        style={{
          background: 'none', border: 'none', outline: 'none',
          color: 'var(--color-text-primary)', fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)', padding: '4px 6px',
          width: '100%', textAlign: 'right',
        }}
      />
      {unit && <span style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', paddingRight: 6, flexShrink: 0 }}>{unit}</span>}
    </div>
  );
}

function SliderRow({ label, value, onChange, min = 0, max = 100, step = 1, unit, tooltip }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string; tooltip?: string;
}) {
  return (
    <PropRow label={label} tooltip={tooltip}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--color-accent)', height: 3 }}
        />
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)', width: 32, textAlign: 'right', flexShrink: 0 }}>
          {Math.round(value)}{unit}
        </span>
      </div>
    </PropRow>
  );
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const safeValue = value || '#000000';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 5, background: safeValue,
          border: '1px solid var(--color-surface-border)', cursor: 'pointer',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        }} />
        <input
          type="color" value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        />
      </div>
      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>
        {label || safeValue.toUpperCase()}
      </span>
    </div>
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', background: 'hsla(0,0%,100%,0.05)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: 6, padding: '4px 8px',
        color: 'var(--color-text-primary)', fontSize: '0.72rem',
        fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Transform Section ───────────────────────────────────────────────────────

function TransformSection({ layer }: { layer: UniversalLayer }) {
  const { updateLayer } = useEditorStore();
  const t = layer.transform;

  const update = (patch: Partial<typeof t>) =>
    updateLayer(layer.id, { transform: { ...t, ...patch } });

  return (
    <SectionHeader title="Transform" icon={<Move size={12} />}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', marginBottom: 3 }}>X</div>
          <NumInput value={t.x} onChange={(v) => update({ x: v })} step={1} unit="px" />
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', marginBottom: 3 }}>Y</div>
          <NumInput value={t.y} onChange={(v) => update({ y: v })} step={1} unit="px" />
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', marginBottom: 3 }}>Escala</div>
          <NumInput value={t.scale} onChange={(v) => update({ scale: v })} step={0.01} min={0.01} max={10} />
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', marginBottom: 3 }}>Rotação</div>
          <NumInput value={t.rotation} onChange={(v) => update({ rotation: v })} step={1} unit="°" />
        </div>
      </div>
      <SliderRow label="Opacidade" value={t.opacity * 100} onChange={(v) => update({ opacity: v / 100 })} unit="%" />
      <div style={{ marginTop: 4 }}>
        <button
          onClick={() => update({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 })}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: '1px solid var(--color-surface-border)',
            borderRadius: 5, padding: '3px 8px', color: 'var(--color-text-ghost)',
            cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'var(--font-sans)',
          }}
        >
          <RotateCcw size={10} /> Resetar
        </button>
      </div>
    </SectionHeader>
  );
}

// ─── Animation Section ───────────────────────────────────────────────────────

const ENTRY_PRESETS: { value: AnimationEntryPreset; label: string }[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'fadeUp', label: 'Subir + Fade' },
  { value: 'fadeDown', label: 'Descer + Fade' },
  { value: 'slideLeft', label: 'Deslizar ←' },
  { value: 'slideRight', label: 'Deslizar →' },
  { value: 'scaleIn', label: 'Escala Crescer' },
  { value: 'blurIn', label: 'Desfoque Entrar' },
  { value: 'bounceIn', label: 'Bounce' },
  { value: 'elasticWhip', label: 'Elástico' },
  { value: 'elegantWipe', label: 'Wipe Elegante' },
  { value: 'kineticChop', label: 'Kinetic Chop' },
];

const EXIT_PRESETS: { value: AnimationExitPreset; label: string }[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'fadeOut', label: 'Fade Out' },
  { value: 'fadeUp', label: 'Subir + Fade' },
  { value: 'fadeDown', label: 'Descer + Fade' },
  { value: 'scaleOut', label: 'Escala Diminuir' },
  { value: 'blurOut', label: 'Desfoque Sair' },
  { value: 'dissolve', label: 'Dissolver' },
  { value: 'bounceOut', label: 'Bounce Out' },
  { value: 'elasticSnap', label: 'Snap Elástico' },
];

const AUTO_ANIMATE_PRESETS: { value: AutoAnimatePreset; label: string }[] = [
  { value: 'float', label: 'Flutuar' },
  { value: 'pulse', label: 'Pulsar' },
  { value: 'wiggle', label: 'Wiggle' },
  { value: 'breathe', label: 'Respirar' },
  { value: 'bounce', label: 'Quicar' },
  { value: 'drift', label: 'Deriva' },
  { value: 'orbit', label: 'Orbitar' },
];

function AnimationSection({ layer }: { layer: UniversalLayer }) {
  const { updateLayer } = useEditorStore();
  const anim = layer.animation;

  const update = (patch: Partial<typeof anim>) =>
    updateLayer(layer.id, { animation: { ...anim, ...patch } });

  return (
    <SectionHeader title="Animação" icon={<Zap size={12} />}>
      <PropRow label="Entrada" tooltip="Como a camada aparece na cena">
        <SelectInput value={anim.entryPreset} onChange={(v) => update({ entryPreset: v as AnimationEntryPreset })} options={ENTRY_PRESETS} />
      </PropRow>
      <PropRow label="Saída" tooltip="Como a camada desaparece da cena">
        <SelectInput value={anim.exitPreset} onChange={(v) => update({ exitPreset: v as AnimationExitPreset })} options={EXIT_PRESETS} />
      </PropRow>
      
      <AdvancedSection>
        {anim.entryPreset !== 'none' && (
          <SliderRow label="Duração Entrada" value={anim.entryDuration * 100} onChange={(v) => update({ entryDuration: v / 100 })} min={10} max={300} unit="%" tooltip="Duração da animação de entrada" />
        )}
        {anim.exitPreset !== 'none' && (
          <SliderRow label="Duração Saída" value={anim.exitDuration * 100} onChange={(v) => update({ exitDuration: v / 100 })} min={10} max={300} unit="%" />
        )}
      </AdvancedSection>

      {/* Auto-Animate */}
      <div style={{ marginTop: 10, padding: '10px', background: 'hsla(271,76%,53%,0.05)', borderRadius: 8, border: '1px solid hsla(271,76%,53%,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={12} color="hsla(271,76%,70%,1)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Auto-Animar</span>
          </div>
          <label style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}>
            <input type="checkbox" checked={anim.autoAnimate} onChange={(e) => update({ autoAnimate: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
            <div style={{
              width: 32, height: 18, borderRadius: 9,
              background: anim.autoAnimate ? 'hsla(271,76%,53%,0.8)' : 'hsla(0,0%,100%,0.1)',
              transition: 'background 0.2s ease',
              border: '1px solid hsla(0,0%,100%,0.15)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: anim.autoAnimate ? 16 : 2,
                width: 12, height: 12, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </label>
        </div>
        {anim.autoAnimate && (
          <>
            <PropRow label="Movimento">
              <SelectInput value={anim.autoAnimatePreset} onChange={(v) => update({ autoAnimatePreset: v as AutoAnimatePreset })} options={AUTO_ANIMATE_PRESETS} />
            </PropRow>
            <SliderRow label="Intensidade" value={anim.autoAnimateIntensity} onChange={(v) => update({ autoAnimateIntensity: v })} min={0} max={100} unit="" tooltip="Controla amplitude e velocidade do movimento automático" />
          </>
        )}
      </div>
    </SectionHeader>
  );
}

function TextProperties({ layer }: { layer: UniversalLayer }) {
  const { updateLayer, availableFonts, showToast } = useEditorStore();
  const d = layer.textData!;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<TextLayerData>) =>
    updateLayer(layer.id, { textData: { ...d, ...patch } });

  const fontesPadrao = ['Inter', 'Space Grotesk', 'Playfair Display', 'Syne', 'JetBrains Mono', 'Bebas Neue'];
  const todasFontes = [...new Set([...fontesPadrao, ...availableFonts])];

  const processFontFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
      showToast({
        type: 'error',
        title: 'Formato inválido',
        message: 'Por favor, envie um arquivo de fonte válido (.ttf, .otf, .woff, .woff2).'
      });
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const fontName = (file.name.split('.')[0] || 'CustomFont').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
      const fontFace = new FontFace(fontName, buffer);
      
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      
      useEditorStore.setState((state) => ({
        availableFonts: [...new Set([...state.availableFonts, fontName])]
      }));
      
      update({ fontFamily: fontName });
      
      showToast({
        type: 'success',
        title: 'Fonte importada!',
        message: `A fonte "${fontName}" foi carregada e aplicada com sucesso.`,
        duration: 3500
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Erro ao carregar fonte',
        message: err?.message || 'Falha ao processar o arquivo de fonte.'
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFontFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFontFile(file);
    }
  };

  return (
    <SectionHeader title="Texto" icon={<Type size={12} />}>
      {/* Container with drag and drop */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          borderRadius: 8,
          transition: 'all 0.2s',
          border: isDragging ? '1px dashed var(--color-accent)' : '1px solid transparent',
          background: isDragging ? 'var(--color-accent-muted)' : 'transparent',
          padding: isDragging ? 4 : 0,
        }}
      >
        {isDragging && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', borderRadius: 8,
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-accent)'
          }}>
            Solte o arquivo de fonte aqui
          </div>
        )}

        {/* Text content */}
        <div style={{ marginBottom: 10 }}>
          <textarea
            value={d.text}
            onChange={(e) => update({ text: e.target.value })}
            rows={2}
            style={{
              width: '100%', background: 'hsla(0,0%,100%,0.05)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 8, padding: '7px 10px',
              color: 'var(--color-text-primary)', fontSize: '0.78rem',
              fontFamily: 'var(--font-sans)', resize: 'none', outline: 'none',
              lineHeight: 1.4, transition: 'border-color 0.15s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-surface-border)'}
          />
        </div>

        {/* Color + Align */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <ColorInput value={d.color} onChange={(v) => update({ color: v })} />
          <div style={{ display: 'flex', gap: 2 }}>
            {(['left', 'center', 'right'] as const).map((align) => (
              <button key={align} onClick={() => update({ textAlign: align })}
                style={{
                  padding: '4px 6px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: d.textAlign === align ? 'hsla(191,100%,50%,0.12)' : 'transparent',
                  color: d.textAlign === align ? 'var(--color-accent)' : 'var(--color-text-ghost)',
                  display: 'flex', alignItems: 'center',
                }}>
                {align === 'left' ? <AlignLeft size={13} /> : align === 'center' ? <AlignCenter size={13} /> : <AlignRight size={13} />}
              </button>
            ))}
          </div>
        </div>

        {/* Font Selection Dropdown & Manual Upload */}
        <PropRow label="Fonte">
          <div style={{ display: 'flex', gap: 6, width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <SelectInput 
                value={d.fontFamily} 
                onChange={(v) => update({ fontFamily: v })} 
                options={todasFontes.map(f => ({ value: f, label: f }))} 
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload de Fonte (.ttf, .otf, .woff)"
              style={{
                flexShrink: 0, padding: '0 8px', borderRadius: 6,
                background: 'hsla(0,0%,100%,0.05)', border: '1px solid var(--color-surface-border)',
                color: 'var(--color-text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'hsla(191,100%,50%,0.12)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'hsla(0,0%,100%,0.05)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Upload size={13} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".ttf,.otf,.woff,.woff2" 
              style={{ display: 'none' }} 
            />
          </div>
        </PropRow>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', marginBottom: 3 }}>Tamanho</div>
          <NumInput value={d.fontSize} onChange={(v) => update({ fontSize: v })} min={0.5} max={30} step={0.1} unit="rem" />
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-ghost)', marginBottom: 3 }}>Peso</div>
          <SelectInput value={String(d.fontWeight)} onChange={(v) => update({ fontWeight: Number(v) })}
            options={[100,200,300,400,500,600,700,800,900].map(w => ({ value: String(w), label: String(w) }))} />
        </div>
      </div>

      <SliderRow label="Espaçamento" value={d.letterSpacing * 100} onChange={(v) => update({ letterSpacing: v / 100 })} min={-10} max={50} unit="" tooltip="Espaçamento entre letras (em)" />

      <PropRow label="Caixa">
        <SelectInput value={d.textTransform} onChange={(v) => update({ textTransform: v as typeof d.textTransform })}
          options={[
            { value: 'none', label: 'Normal' },
            { value: 'uppercase', label: 'MAIÚSCULAS' },
            { value: 'lowercase', label: 'minúsculas' },
            { value: 'capitalize', label: 'Capitalizar' },
          ]} />
      </PropRow>

      <AdvancedSection>
        {/* Trail */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>Efeito Trail/Echo</span>
          <label style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}>
            <input type="checkbox" checked={d.trailEnabled} onChange={(e) => update({ trailEnabled: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
            <div style={{
              width: 28, height: 16, borderRadius: 8,
              background: d.trailEnabled ? 'hsla(191,100%,50%,0.7)' : 'hsla(0,0%,100%,0.1)',
              transition: 'background 0.2s', border: '1px solid hsla(0,0%,100%,0.1)', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 2, left: d.trailEnabled ? 13 : 2,
                width: 10, height: 10, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </label>
        </div>
        {d.trailEnabled && (
          <>
            <PropRow label="Cor Trail"><ColorInput value={d.trailColor} onChange={(v) => update({ trailColor: v })} /></PropRow>
            <SliderRow label="Instâncias" value={d.trailInstances} onChange={(v) => update({ trailInstances: Math.round(v) })} min={1} max={10} step={1} />
            <PropRow label="Estilo">
              <SelectInput value={d.trailStyle} onChange={(v) => update({ trailStyle: v as typeof d.trailStyle })}
                options={[
                  { value: 'solid', label: 'Sólido' }, { value: 'stroke', label: 'Contorno' },
                  { value: 'blur', label: 'Desfoque' }, { value: 'chromatic', label: 'Cromático' },
                ]} />
            </PropRow>
            <PropRow label="Blend Mode">
              <SelectInput value={d.trailBlendMode} onChange={(v) => update({ trailBlendMode: v })}
                options={['normal','screen','multiply','overlay','color-dodge','hard-light'].map(m => ({ value: m, label: m }))} />
            </PropRow>
          </>
        )}
        <PropRow label="Split por">
          <SelectInput value={d.splitMode} onChange={(v) => update({ splitMode: v as typeof d.splitMode })}
            options={[
              { value: 'none', label: 'Nenhum (todo o texto)' }, { value: 'chars', label: 'Letra por letra' },
              { value: 'words', label: 'Palavra por palavra' }, { value: 'lines', label: 'Linha por linha' },
            ]} />
        </PropRow>
      </AdvancedSection>
    </SectionHeader>
  );
}

// ─── Element Properties Section ──────────────────────────────────────────────

function ElementProperties({ layer }: { layer: UniversalLayer }) {
  const { updateLayer } = useEditorStore();
  const d = layer.elementData!;

  const update = (patch: Partial<ElementLayerData>) =>
    updateLayer(layer.id, { elementData: { ...d, ...patch } });

  return (
    <SectionHeader title="Elemento" icon={<Layers size={12} />}>
      <PropRow label="Forma">
        <SelectInput value={d.shapeType} onChange={(v) => update({ shapeType: v as ElementLayerData['shapeType'] })}
          options={[
            { value: 'circle', label: 'Círculo' }, { value: 'square', label: 'Quadrado' },
            { value: 'star', label: 'Estrela' }, { value: 'hexagon', label: 'Hexágono' },
            { value: 'spirograph', label: 'Espirógrafo' }, { value: 'orbital', label: 'Orbital' },
            { value: 'mesh', label: 'Rede/Mesh' }, { value: 'concentric', label: 'Concêntrico' },
          ]} />
      </PropRow>
      <PropRow label="Cor">
        <div style={{ display: 'flex', gap: 6 }}>
          {d.colors.map((c, i) => (
            <ColorInput key={i} value={c} onChange={(v) => {
              const newColors = [...d.colors]; newColors[i] = v; update({ colors: newColors });
            }} />
          ))}
        </div>
      </PropRow>
      <PropRow label="Modo Cor">
        <SelectInput value={d.colorMode} onChange={(v) => {
          const mode = v as typeof d.colorMode;
          const numColors = mode === 'solid' ? 1 : mode === 'duotone' ? 2 : 3;
          const colors = [...d.colors];
          while (colors.length < numColors) colors.push('#ffffff');
          update({ colorMode: mode, colors: colors.slice(0, numColors) });
        }}
          options={[
            { value: 'original', label: 'Original (SVG)' }, { value: 'solid', label: 'Sólido (1 cor)' },
            { value: 'duotone', label: 'Duotone (2 cores)' }, { value: 'tritone', label: 'Tritone (3 cores)' },
          ]} />
      </PropRow>
      <SliderRow label="Amplitude" value={d.noiseAmplitude} onChange={(v) => update({ noiseAmplitude: v })} min={0} max={200} tooltip="Intensidade do movimento orgânico" />
      <SliderRow label="Frequência" value={d.noiseFrequency * 100} onChange={(v) => update({ noiseFrequency: v / 100 })} min={1} max={300} tooltip="Velocidade do movimento orgânico" />
      <AdvancedSection>
        <PropRow label="Alvos">
          <SelectInput value={d.targetMode} onChange={(v) => update({ targetMode: v as typeof d.targetMode })}
            options={[{ value: 'group', label: 'Grupo inteiro' }, { value: 'paths', label: 'Caminhos individuais' }]} />
        </PropRow>
        <PropRow label="Opacidade">
          <SelectInput value={d.opacityMode} onChange={(v) => update({ opacityMode: v as typeof d.opacityMode })}
            options={[
              { value: 'fixed', label: 'Fixa' }, { value: 'wiggle-group', label: 'Wiggle (grupo)' },
              { value: 'wiggle-paths', label: 'Wiggle (caminhos)' },
            ]} />
        </PropRow>
        <SliderRow label="Oitavas" value={d.noiseOctaves} onChange={(v) => update({ noiseOctaves: Math.round(v) })} min={1} max={8} step={1} tooltip="Oitavas de ruído (mais = mais orgânico)" />
        <SliderRow label="Persistência" value={d.noisePersistence * 100} onChange={(v) => update({ noisePersistence: v / 100 })} min={1} max={100} tooltip="Persistência do ruído fractal" />
      </AdvancedSection>
    </SectionHeader>
  );
}

// ─── Overlay Properties ──────────────────────────────────────────────────────

function OverlayProperties({ layer }: { layer: UniversalLayer }) {
  const { updateLayer } = useEditorStore();
  const d = layer.overlayData!;
  const update = (patch: Partial<OverlayLayerData>) =>
    updateLayer(layer.id, { overlayData: { ...d, ...patch } });

  const OVERLAY_STYLES = [
    { value: 'gradient-top', label: 'Gradiente Topo' },
    { value: 'gradient-bottom', label: 'Gradiente Base' },
    { value: 'gradient-radial', label: 'Vinheta Radial' },
    { value: 'noise-overlay', label: 'Ruído/Noise' },
    { value: 'grain-overlay', label: 'Film Grain' },
    { value: 'light-leak', label: 'Light Leak' },
  ];

  return (
    <SectionHeader title="Overlay" icon={<Palette size={12} />}>
      <PropRow label="Tipo"><SelectInput value={d.overlayStyle} onChange={(v) => update({ overlayStyle: v as typeof d.overlayStyle })} options={OVERLAY_STYLES} /></PropRow>
      <PropRow label="Cor"><ColorInput value={d.color} onChange={(v) => update({ color: v })} /></PropRow>
      <SliderRow label="Intensidade" value={d.intensity} onChange={(v) => update({ intensity: v })} min={0} max={100} unit="%" />
    </SectionHeader>
  );
}

// ─── Shadow Guard Properties ─────────────────────────────────────────────────

function ShadowGuardProperties({ layer }: { layer: UniversalLayer }) {
  const { updateLayer } = useEditorStore();
  const d = layer.shadowGuardData!;
  const update = (patch: Partial<ShadowGuardLayerData>) =>
    updateLayer(layer.id, { shadowGuardData: { ...d, ...patch } });

  return (
    <SectionHeader title="Proteção de Texto" icon={<Settings2 size={12} />}>
      <PropRow label="Estilo">
        <SelectInput value={d.guardStyle} onChange={(v) => update({ guardStyle: v as typeof d.guardStyle })}
          options={[
            { value: 'text-protection-bottom', label: 'Sombra Inferior' },
            { value: 'text-protection-top', label: 'Sombra Superior' },
            { value: 'vignette-soft', label: 'Vinheta Suave' },
            { value: 'vignette-hard', label: 'Vinheta Forte' },
          ]} />
      </PropRow>
      <PropRow label="Cor"><ColorInput value={d.color} onChange={(v) => update({ color: v })} /></PropRow>
      <SliderRow label="Intensidade" value={d.intensity} onChange={(v) => update({ intensity: v })} min={0} max={100} unit="%" tooltip="Opacidade do gradiente de proteção" />
      {(d.guardStyle === 'text-protection-bottom' || d.guardStyle === 'text-protection-top') && (
        <SliderRow label="Altura" value={d.height} onChange={(v) => update({ height: v })} min={10} max={100} unit="%" tooltip="Altura da área de proteção em % do canvas" />
      )}
    </SectionHeader>
  );
}

// ─── Text Box Properties ─────────────────────────────────────────────────────

function TextBoxProperties({ layer }: { layer: UniversalLayer }) {
  const { updateLayer } = useEditorStore();
  const d = layer.textBoxData!;
  const update = (patch: Partial<TextBoxLayerData>) =>
    updateLayer(layer.id, { textBoxData: { ...d, ...patch } });

  return (
    <SectionHeader title="Caixa de Texto" icon={<Square size={12} />}>
      <PropRow label="Estilo">
        <SelectInput value={d.boxStyle} onChange={(v) => update({ boxStyle: v as typeof d.boxStyle })}
          options={[
            { value: 'pill-blur', label: 'Pill Glass' },
            { value: 'rectangle-solid', label: 'Retângulo Sólido' },
            { value: 'rectangle-glass', label: 'Retângulo Glass' },
            { value: 'rounded-dark', label: 'Arredondado Escuro' },
            { value: 'rounded-light', label: 'Arredondado Claro' },
          ]} />
      </PropRow>
      <PropRow label="Fundo"><ColorInput value={d.backgroundColor} onChange={(v) => update({ backgroundColor: v })} /></PropRow>
      <SliderRow label="Borda" value={d.borderRadius} onChange={(v) => update({ borderRadius: v })} min={0} max={80} unit="px" />
      <SliderRow label="Padding" value={d.padding} onChange={(v) => update({ padding: v })} min={0} max={80} unit="px" />
      {(d.boxStyle === 'pill-blur' || d.boxStyle === 'rectangle-glass') && (
        <SliderRow label="Blur" value={d.blur} onChange={(v) => update({ blur: v })} min={0} max={40} unit="px" tooltip="Intensidade do desfoque de fundo (glassmorphism)" />
      )}
    </SectionHeader>
  );
}
function AudioProperties({ track }: { track: AudioTrack }) {
  const { updateAudioTrack } = useEditorStore();
  const update = (patch: Partial<AudioTrack>) => updateAudioTrack(track.id, patch);

  return (
    <SectionHeader title="Faixa de Áudio" icon={<Music size={12} />}>
      <PropRow label="Nome">
        <input
          type="text"
          value={track.name}
          onChange={(e) => update({ name: e.target.value })}
          style={{
            width: '100%',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: '0.72rem',
            color: 'white',
            outline: 'none',
          }}
        />
      </PropRow>
      <SliderRow
        label="Volume"
        value={track.volume * 100}
        onChange={(v) => update({ volume: v / 100 })}
        min={0}
        max={100}
        unit="%"
        tooltip="Volume da faixa de áudio"
      />
      <PropRow label="Fade In">
        <NumInput
          value={track.fadeIn || 0}
          onChange={(v) => update({ fadeIn: v })}
          min={0}
          max={10}
          step={0.1}
          unit="s"
        />
      </PropRow>
      <PropRow label="Fade Out">
        <NumInput
          value={track.fadeOut || 0}
          onChange={(v) => update({ fadeOut: v })}
          min={0}
          max={10}
          step={0.1}
          unit="s"
        />
      </PropRow>
      <PropRow label="Início" tooltip="Tempo de início da faixa na timeline (segundos)">
        <NumInput
          value={track.startTime}
          onChange={(v) => update({ startTime: v })}
          min={0}
          step={0.1}
          unit="s"
        />
      </PropRow>
      <PropRow label="Duração" tooltip="Duração da reprodução do áudio (segundos)">
        <NumInput
          value={track.duration}
          onChange={(v) => update({ duration: v })}
          min={0.1}
          step={0.1}
          unit="s"
        />
      </PropRow>
    </SectionHeader>
  );
}

export function PropertiesPanel() {
  const { layers, selectedLayerId, activeAudioTrackId, audioTracks } = useEditorStore();
  const layer = layers.find(l => l.id === selectedLayerId);
  const audioTrack = audioTracks.find(t => t.id === activeAudioTrackId);

  if (!layer && audioTrack) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '12px 12px 8px',
          borderBottom: '1px solid var(--color-surface-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase', color: 'var(--color-text-muted)',
          }}>
            Ajustes
          </span>
          <span style={{
            fontSize: '0.62rem', color: 'var(--color-text-ghost)',
            background: 'hsla(0,0%,100%,0.04)',
            border: '1px solid var(--color-surface-border)',
            padding: '2px 6px', borderRadius: 4,
          }}>
            audio
          </span>
        </div>

        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <AudioProperties track={audioTrack} />
        </div>
      </div>
    );
  }

  if (!selectedLayerId || !layer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{
          padding: '12px 12px 8px',
          borderBottom: '1px solid var(--color-surface-border)',
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
            textTransform: 'uppercase', color: 'var(--color-text-muted)',
          }}>
            Ajustes
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 16, gap: 8, color: 'var(--color-text-ghost)', background: 'var(--color-bg-secondary)', textAlign: 'center' }}>
          <Settings2 size={16} />
          <span style={{ fontSize: '0.72rem' }}>Selecione um elemento para ver seus ajustes.</span>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '12px 12px 8px',
        borderBottom: '1px solid var(--color-surface-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: 'var(--color-text-muted)',
        }}>
          Ajustes
        </span>
        {layer && (
          <span style={{
            fontSize: '0.62rem', color: 'var(--color-text-ghost)',
            background: 'hsla(0,0%,100%,0.04)',
            border: '1px solid var(--color-surface-border)',
            padding: '2px 6px', borderRadius: 4,
          }}>
            {layer.type}
          </span>
        )}
      </div>

      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Shared: Transform */}
        <TransformSection layer={layer} />

        {/* Shared: Animation */}
        <AnimationSection layer={layer} />

        {/* Type-specific properties */}
        {layer.type === 'text' && <TextProperties layer={layer} />}
        {layer.type === 'element' && <ElementProperties layer={layer} />}
        {layer.type === 'overlay' && <OverlayProperties layer={layer} />}
        {layer.type === 'shadow-guard' && <ShadowGuardProperties layer={layer} />}
        {layer.type === 'text-box' && <TextBoxProperties layer={layer} />}
      </div>
    </div>
  );
}
