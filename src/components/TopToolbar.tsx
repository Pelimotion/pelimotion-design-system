/**
 * TopToolbar — Pelimotion Design System
 *
 * 5 semantic zones from left to right:
 *  1. Engine Context  — active engine label + capture resolution/fps
 *  2. Layout Modes    — freeform / stack / side-by-side / grid (typography only)
 *  3. Alignment       — align items in structured modes (typography only)
 *  4. Canvas Guides   — aspect ratio safe zone overlay selector
 *  5. Controls        — Gizmo toggle + status pill
 */
import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { TypographyLayoutMode } from '@/types/motion.types';
import type { AspectRatio } from './CanvasGuides';
import { RATIOS } from './CanvasGuides';
import {
  Activity,
  MousePointer2,
  Layers,
  AlignCenter,
  AlignHorizontalDistributeCenter,
  LayoutGrid,
  Maximize2,
  AlignLeft,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyCenter,
} from 'lucide-react';

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      width: 1,
      height: 20,
      background: 'var(--color-surface-border)',
      opacity: 0.6,
      flexShrink: 0,
      margin: '0 4px',
    }} />
  );
}

interface ToolButtonProps {
  active?: boolean;
  onClick: () => void;
  title: string;
  label?: string;
  children: React.ReactNode;
  accentColor?: string;
  danger?: boolean;
}

function ToolButton({ active, onClick, title, label, children, accentColor, danger }: ToolButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: label ? '5px 10px' : '6px 8px',
        borderRadius: 7,
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.72rem',
        fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.01em',
        transition: 'all 0.15s cubic-bezier(0.16,1,0.3,1)',
        outline: 'none',
        flexShrink: 0,
        // Dynamic states
        background: active
          ? `${accentColor || 'var(--color-accent)'}22`
          : hovered
          ? 'var(--color-surface-hover)'
          : 'transparent',
        color: active
          ? (accentColor || 'var(--color-accent)')
          : danger
          ? 'var(--color-error)'
          : 'var(--color-text-secondary)',
        boxShadow: active
          ? `inset 0 0 0 1px ${accentColor || 'var(--color-accent)'}55`
          : hovered
          ? 'inset 0 0 0 1px var(--color-surface-border)'
          : 'none',
        transform: hovered && !active ? 'translateY(-0.5px)' : 'none',
      }}
    >
      {children}
      {label && <span>{label}</span>}
    </button>
  );
}

// ─── Layout Mode definitions ──────────────────────────────────────────────────

interface LayoutModeDef {
  id: TypographyLayoutMode;
  label: string;
  title: string;
  icon: React.ReactNode;
}

const LAYOUT_MODES: LayoutModeDef[] = [
  {
    id: 'freeform',
    label: 'Livre',
    title: 'Modo Livre — arrastar com total liberdade de posição',
    icon: <MousePointer2 size={14} />,
  },
  {
    id: 'stack',
    label: 'Stack',
    title: 'Empilhado — camadas em coluna vertical centralizada',
    icon: <Layers size={14} />,
  },
  {
    id: 'sideBySide',
    label: 'Lado a Lado',
    title: 'Lado a Lado — camadas em linha horizontal',
    icon: <AlignHorizontalDistributeCenter size={14} />,
  },
  {
    id: 'grid',
    label: 'Grid',
    title: 'Grade Inteligente — layout grid automático',
    icon: <LayoutGrid size={14} />,
  },
];

// ─── Aspect ratio pill ────────────────────────────────────────────────────────

const RATIO_OPTIONS: AspectRatio[] = ['none', '16:9', '9:16', '1:1', '4:5'];

function AspectRatioSelector() {
  const { activeAspectRatio, setAspectRatio } = useEditorStore();
  const [open, setOpen] = useState(false);

  const currentDef = activeAspectRatio !== 'none' ? RATIOS[activeAspectRatio as Exclude<AspectRatio, 'none'>] : null;

  return (
    <div style={{ position: 'relative' }}>
      <ToolButton
        active={activeAspectRatio !== 'none'}
        onClick={() => setOpen(o => !o)}
        title="Guias de Aspect Ratio — sobreposição visual da área segura"
        label={currentDef ? currentDef.label : 'Guias'}
        accentColor={currentDef?.color}
      >
        <Maximize2 size={14} />
      </ToolButton>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9990 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 10,
            padding: 8,
            zIndex: 9991,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--color-text-ghost)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '4px 8px 8px',
              borderBottom: '1px solid var(--color-surface-border)',
              marginBottom: 6,
            }}>
              Safe Zone Guide
            </div>
            {RATIO_OPTIONS.map(ratio => {
              const def = ratio !== 'none' ? RATIOS[ratio as Exclude<AspectRatio, 'none'>] : null;
              const isActive = activeAspectRatio === ratio;
              return (
                <button
                  key={ratio}
                  onClick={() => { setAspectRatio(ratio); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    background: isActive ? `${def?.color || 'var(--color-accent)'}18` : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-hover)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {def && (
                    <div style={{
                      width: 14, height: 14, flexShrink: 0,
                      borderRadius: 2,
                      border: `2px solid ${def.color}`,
                      background: isActive ? `${def.color}33` : 'transparent',
                    }} />
                  )}
                  {!def && (
                    <div style={{
                      width: 14, height: 14, flexShrink: 0,
                      borderRadius: 2,
                      border: '2px solid var(--color-surface-border)',
                    }} />
                  )}
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isActive ? (def?.color || 'var(--color-accent)') : 'var(--color-text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {ratio === 'none' ? 'Desativado' : ratio}
                    </div>
                    {def && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-text-ghost)', marginTop: 1 }}>
                        {def.description}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div style={{
                      marginLeft: 'auto',
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: def?.color || 'var(--color-accent)',
                      flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Alignment Tools ──────────────────────────────────────────────────────────

function AlignmentTools() {
  const { motionConfig, updateTypography } = useEditorStore();
  const layoutMode = motionConfig.typography.layoutMode;
  const alignItems = motionConfig.typography.layoutAlignItems || 'center';
  const justifyContent = motionConfig.typography.layoutJustifyContent || 'center';
  const isColumn = layoutMode === 'stack';

  if (layoutMode === 'freeform') return null;

  // For column (stack): alignItems = cross-axis (horizontal), justifyContent = main-axis (vertical)
  // For row (sideBySide/grid): alignItems = cross-axis (vertical), justifyContent = main-axis (horizontal)
  const crossAxisOptions = [
    { value: 'flex-start', icon: isColumn ? <AlignLeft size={13} /> : <AlignLeft size={13} style={{ transform: 'rotate(90deg)' }} />, title: isColumn ? 'Alinhar à esquerda' : 'Alinhar ao topo' },
    { value: 'center', icon: <AlignCenter size={13} />, title: 'Centralizar' },
    { value: 'flex-end', icon: isColumn ? <AlignRight size={13} /> : <AlignRight size={13} style={{ transform: 'rotate(90deg)' }} />, title: isColumn ? 'Alinhar à direita' : 'Alinhar ao fundo' },
  ];

  const mainAxisOptions = [
    { value: 'flex-start', icon: <AlignJustify size={13} style={{ transform: isColumn ? 'none' : 'rotate(90deg)' }} />, title: 'Distribuir ao início' },
    { value: 'center', icon: <AlignVerticalJustifyCenter size={13} style={{ transform: isColumn ? 'none' : 'rotate(90deg)' }} />, title: 'Distribuir ao centro' },
    { value: 'flex-end', icon: <AlignJustify size={13} style={{ transform: isColumn ? 'scaleY(-1)' : 'rotate(90deg) scaleX(-1)' }} />, title: 'Distribuir ao fim' },
    { value: 'space-between', icon: <AlignJustify size={13} style={{ opacity: 0.7 }} />, title: 'Espaçar uniformemente' },
  ];

  return (
    <>
      <Divider />
      {/* Cross-axis alignment */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} title="Alinhamento transversal">
        {crossAxisOptions.map(opt => (
          <ToolButton
            key={opt.value}
            active={alignItems === opt.value}
            onClick={() => updateTypography({ layoutAlignItems: opt.value as any })}
            title={opt.title}
          >
            {opt.icon}
          </ToolButton>
        ))}
      </div>

      <div style={{ width: 1, height: 12, background: 'var(--color-surface-border)', opacity: 0.4, margin: '0 2px' }} />

      {/* Main-axis distribution */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} title="Distribuição principal">
        {mainAxisOptions.map(opt => (
          <ToolButton
            key={opt.value}
            active={justifyContent === opt.value}
            onClick={() => updateTypography({ layoutJustifyContent: opt.value as any })}
            title={opt.title}
          >
            {opt.icon}
          </ToolButton>
        ))}
      </div>

      <Divider />

      {/* Gap control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: '0.67rem', color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          GAP
        </span>
        <input
          type="number"
          className="number-input"
          value={motionConfig.typography.layoutGap || 0}
          min={0}
          max={200}
          step={4}
          onChange={(e) => updateTypography({ layoutGap: Number(e.target.value) })}
          style={{ width: 48, padding: '3px 6px', fontSize: '0.75rem', textAlign: 'center' }}
        />
        <span style={{ fontSize: '0.67rem', color: 'var(--color-text-ghost)', fontFamily: 'var(--font-mono)' }}>px</span>
      </div>
    </>
  );
}

// ─── Gizmo Toggle ─────────────────────────────────────────────────────────────

function GizmoToggle() {
  const { showGizmo, toggleGizmo } = useEditorStore();

  return (
    <ToolButton
      active={showGizmo}
      onClick={toggleGizmo}
      title={showGizmo ? 'Ocultar Gizmo de transformação' : 'Mostrar Gizmo de transformação'}
      label="Gizmo"
    >
      {/* Custom Gizmo icon: selection box with handles */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="2" width="10" height="10" rx="1"
          stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Corner handles */}
        <rect x="0.5" y="0.5" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="10.5" y="0.5" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="0.5" y="10.5" width="3" height="3" rx="0.5" fill="currentColor" />
        <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" fill="currentColor" />
        {/* Rotation handle */}
        <circle cx="7" cy="0.5" r="1" fill="currentColor" opacity={showGizmo ? 1 : 0.4} />
        {/* Strikethrough when hidden */}
        {!showGizmo && (
          <line x1="1" y1="1" x2="13" y2="13" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" />
        )}
      </svg>
    </ToolButton>
  );
}

// ─── Main Toolbar ─────────────────────────────────────────────────────────────

export function TopToolbar() {
  const {
    motionConfig,
    activePanel,
    updateTypography,
    incrementAnimKey,
  } = useEditorStore();

  const layoutMode = motionConfig.typography.layoutMode || 'freeform';

  const handleLayoutMode = (mode: TypographyLayoutMode) => {
    // When switching to a structured mode, also set sensible alignment defaults
    const defaults: Partial<typeof motionConfig.typography> = { layoutMode: mode };
    if (mode !== 'freeform') {
      if (!motionConfig.typography.layoutAlignItems) defaults.layoutAlignItems = 'center';
      if (!motionConfig.typography.layoutJustifyContent) defaults.layoutJustifyContent = 'center';
    }
    updateTypography(defaults);
  };

  return (
    <header
      id="top-bar"
      className="glass-panel animate-fade-in stagger-1"
      style={{
        padding: '0 16px',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        gap: 8,
        flexShrink: 0,
      }}
    >
      {/* ── Zone 1: Engine Context ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Activity size={14} color="var(--color-accent)" />
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}>
            {activePanel === 'typography' ? 'Tipografia'
              : activePanel === 'generative' ? 'Generativo'
              : activePanel === 'library' ? 'Biblioteca'
              : activePanel === 'composition' ? 'Composição'
              : 'Exportar'}
          </span>
        </div>
        <div style={{
          fontSize: '0.68rem',
          color: 'var(--color-text-ghost)',
          fontFamily: 'var(--font-mono)',
          background: 'var(--color-surface-hover)',
          padding: '2px 8px',
          borderRadius: 5,
          border: '1px solid var(--color-surface-border)',
        }}>
          {motionConfig.canvas.captureResolution.width}×{motionConfig.canvas.captureResolution.height}
          <span style={{ opacity: 0.5, margin: '0 3px' }}>@</span>
          {motionConfig.canvas.captureFps}fps
        </div>
      </div>

      <Divider />

      {/* ── Zone 2: Layout Modes (typography only) ─────────────────────── */}
      {activePanel === 'typography' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} role="group" aria-label="Modo de Layout">
            {LAYOUT_MODES.map(mode => (
              <ToolButton
                key={mode.id}
                active={layoutMode === mode.id}
                onClick={() => handleLayoutMode(mode.id)}
                title={mode.title}
                label={mode.label}
              >
                {mode.icon}
              </ToolButton>
            ))}
          </div>

          {/* ── Zone 3: Alignment (only in structured modes) ──────────── */}
          <AlignmentTools />

          <Divider />
        </>
      )}

      {/* ── Zone 4: Canvas Guides ────────────────────────────────────── */}
      <AspectRatioSelector />

      <Divider />

      {/* ── Zone 5: Controls + Status ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <GizmoToggle />

        {activePanel === 'typography' && (
          <ToolButton
            onClick={incrementAnimKey}
            title="Reiniciar efeito — reconstrói a timeline GSAP do zero (use após editar texto ou trail)"
            label="Reiniciar"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5a4.5 4.5 0 1 0 .9-2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M2 2.5v2h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ToolButton>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 10px 3px 7px',
          borderRadius: 20,
          background: 'hsla(157, 100%, 40%, 0.1)',
          border: '1px solid hsla(157, 100%, 40%, 0.2)',
          fontSize: '0.72rem',
          fontWeight: 500,
          color: 'var(--color-success)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-success)',
            boxShadow: '0 0 8px hsla(157, 100%, 40%, 0.6)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          Pronto
        </div>
      </div>
    </header>
  );
}
