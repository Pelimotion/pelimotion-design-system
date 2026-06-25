/**
 * TopBar — Pelimotion v3.0
 *
 * Figma-inspired top bar with:
 *  [Logo] [Project Name] | [Add Text ▼] [Add Element ▼] | [Play] | [Biblioteca] | [Aspect Ratio] | [Zoom]
 *
 * Replaces the old TopToolbar with a cleaner, more focused design.
 */
import React, { useState, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import {
  Zap, Type, Layers, Play, Pause, BookOpen,
  ChevronDown, Plus, Shield, Square, ImageIcon,
  ZoomIn, ZoomOut, Maximize2, Undo2, Redo2,
  HelpCircle, X, Keyboard,
} from 'lucide-react';
import {
  createTextLayer, createElementLayer,
  createOverlayLayer, createShadowGuardLayer, createTextBoxLayer,
} from '@/types/universalLayers.types';

// ─── Sub-components ──────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ width: 1, height: 20, background: 'var(--color-surface-border)', flexShrink: 0, margin: '0 2px', opacity: 0.7 }} />;
}

function TopBtn({
  onClick, title, children, active = false, accent = false, danger = false,
}: {
  onClick: () => void; title: string; children: React.ReactNode;
  active?: boolean; accent?: boolean; danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '5px 9px', borderRadius: 7, border: 'none', cursor: 'pointer',
        fontSize: '0.72rem', fontWeight: 500, fontFamily: 'var(--font-sans)',
        transition: 'all 0.15s cubic-bezier(0.16,1,0.3,1)',
        flexShrink: 0,
        background: active
          ? 'hsla(191,100%,50%,0.12)'
          : accent
          ? 'hsla(191,100%,50%,0.08)'
          : hovered
          ? 'hsla(0,0%,100%,0.06)'
          : 'transparent',
        color: active
          ? 'var(--color-accent)'
          : accent
          ? 'var(--color-accent)'
          : danger
          ? 'hsla(0,80%,65%,1)'
          : hovered
          ? 'var(--color-text-primary)'
          : 'var(--color-text-secondary)',
        boxShadow: active ? 'inset 0 0 0 1px hsla(191,100%,50%,0.25)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

// ─── Add Layer Dropdown ──────────────────────────────────────────────────────

function AddDropdown({ type }: { type: 'text' | 'element' }) {
  const { addLayer, setLibraryModalOpen } = useEditorStore();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  const textItems = [
    { label: 'Texto Simples', icon: <Type size={13} />, action: () => addLayer(createTextLayer({ textData: { text: 'SEU TEXTO' } as any })) },
    { label: 'Título Grande', icon: <Type size={13} />, action: () => addLayer(createTextLayer({ textData: { text: 'TÍTULO', fontSize: 8, fontWeight: 900 } as any })) },
    { label: 'Legenda / Caption', icon: <Type size={13} />, action: () => addLayer(createTextLayer({ name: 'Legenda', textData: { text: 'legenda aqui', fontSize: 1.8, fontWeight: 400, textTransform: 'none' } as any })) },
  ];

  const elementItems = [
    { label: 'Forma / SVG', icon: <Layers size={13} />, action: () => addLayer(createElementLayer()) },
    { label: 'Overlay', icon: <ImageIcon size={13} />, action: () => addLayer(createOverlayLayer()) },
    { label: 'Proteção de Texto', icon: <Shield size={13} />, action: () => addLayer(createShadowGuardLayer()) },
    { label: 'Caixa de Texto', icon: <Square size={13} />, action: () => addLayer(createTextBoxLayer()) },
    { label: 'Da Biblioteca…', icon: <BookOpen size={13} />, action: () => { setLibraryModalOpen(true); } },
  ];

  const items = type === 'text' ? textItems : elementItems;
  const label = type === 'text' ? 'Texto' : 'Elemento';
  const Icon = type === 'text' ? Type : Layers;
  const accentHsl = type === 'text' ? '191,100%,50%' : '271,76%,53%';

  return (
    <div ref={btnRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
          background: `hsla(${accentHsl}, 0.1)`,
          color: `hsla(${accentHsl}, 0.9)`,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = `hsla(${accentHsl}, 0.18)`}
        onMouseLeave={(e) => e.currentTarget.style.background = `hsla(${accentHsl}, 0.1)`}
      >
        <Plus size={13} />
        <Icon size={13} />
        <span>{label}</span>
        <ChevronDown size={11} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 999,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 10, padding: 4,
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)', minWidth: 190,
          }}>
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => { item.action(); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 10px', borderRadius: 7, border: 'none',
                  background: 'transparent', color: 'var(--color-text-secondary)',
                  cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'var(--font-sans)',
                  textAlign: 'left', transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'hsla(0,0%,100%,0.06)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
              >
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Zoom Controls ───────────────────────────────────────────────────────────

function ZoomControls() {
  const { camera, setCamera, resetCamera, exportConfig } = useEditorStore();

  const getFitScale = () => {
    const [wStr, hStr] = (exportConfig.resolution || '1920x1080').split('x');
    const w = parseInt(wStr || '1920', 10);
    const h = parseInt(hStr || '1080', 10);
    const availW = window.innerWidth - 520 - 32;
    const availH = window.innerHeight - 96 - 96;
    return Math.min(availW / w, availH / h);
  };

  const zoom = Math.round(camera.z * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <TopBtn onClick={() => setCamera({ z: Math.max(0.1, camera.z - 0.1) })} title="Reduzir zoom">
        <ZoomOut size={14} />
      </TopBtn>
      <button
        onClick={() => { const fit = getFitScale(); setCamera({ z: 1 / fit, x: 0, y: 0 }); }}
        title="Ajustar ao ecrã"
        style={{
          background: 'none', border: '1px solid var(--color-surface-border)',
          borderRadius: 5, padding: '3px 8px', color: 'var(--color-text-ghost)',
          cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
          minWidth: 44, textAlign: 'center',
        }}
      >
        {zoom}%
      </button>
      <TopBtn onClick={() => setCamera({ z: Math.min(10, camera.z + 0.1) })} title="Aumentar zoom">
        <ZoomIn size={14} />
      </TopBtn>
      <TopBtn onClick={() => resetCamera()} title="Encaixar canvas">
        <Maximize2 size={13} />
      </TopBtn>
    </div>
  );
}

// ─── Keyboard Shortcuts HUD ──────────────────────────────────────────────────

const SHORTCUTS = [
  { group: 'Playback', items: [
    { key: 'Space', desc: 'Play / Pausar' },
    { key: '← →', desc: 'Mover playhead 0.1s' },
  ]},
  { group: 'Elementos', items: [
    { key: 'Backspace', desc: 'Deletar elemento ativo' },
    { key: 'Cmd+D', desc: 'Duplicar elemento' },
    { key: 'Cmd+Shift+D', desc: 'Dividir no playhead' },
  ]},
  { group: 'Histórico', items: [
    { key: 'Cmd+Z', desc: 'Desfazer' },
    { key: 'Cmd+Shift+Z', desc: 'Refazer' },
    { key: 'Cmd+Y', desc: 'Refazer (alternativo)' },
  ]},
  { group: 'Canvas', items: [
    { key: 'Cmd+Scroll', desc: 'Zoom in/out' },
    { key: 'Space+Drag', desc: 'Pan do canvas' },
    { key: 'Middle Click', desc: 'Pan (alternativo)' },
  ]},
  { group: 'Edição', items: [
    { key: 'Cmd+C', desc: 'Copiar elemento' },
    { key: 'Cmd+V', desc: 'Colar no playhead' },
    { key: '?', desc: 'Atalhos do teclado' },
    { key: 'Esc', desc: 'Fechar painel / Desselecionar' },
  ]},
];

function ShortcutsHUD({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9001,
        width: 'min(520px, 90vw)',
        background: 'linear-gradient(145deg, #141414 0%, #101010 100%)',
        border: '1px solid hsla(0,0%,100%,0.08)',
        borderRadius: 18,
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        animation: 'hudIn 0.22s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 20px', borderBottom: '1px solid hsla(0,0%,100%,0.07)',
        }}>
          <Keyboard size={16} color="var(--color-accent)" />
          <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            Atalhos do Teclado
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-ghost)', padding: 4, borderRadius: 6, display: 'flex' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-ghost)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {SHORTCUTS.map(group => (
            <div key={group.group}>
              <p style={{
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--color-accent)',
                margin: '0 0 10px', fontFamily: 'var(--font-display)',
              }}>{group.group}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.items.map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{item.desc}</span>
                    <kbd style={{
                      fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
                      background: 'hsla(0,0%,100%,0.06)',
                      border: '1px solid hsla(0,0%,100%,0.12)',
                      borderBottom: '2px solid hsla(0,0%,100%,0.08)',
                      borderRadius: 5, padding: '2px 6px',
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid hsla(0,0%,100%,0.06)',
          background: 'hsla(0,0%,0%,0.2)',
          fontSize: '0.65rem', color: 'var(--color-text-ghost)', textAlign: 'center',
        }}>
          Pressione <kbd style={{ fontFamily: 'var(--font-mono)', background: 'hsla(0,0%,100%,0.06)', border: '1px solid hsla(0,0%,100%,0.1)', borderRadius: 3, padding: '1px 5px', fontSize: '0.6rem' }}>?</kbd> a qualquer momento para abrir este painel
        </div>

        <style>{`
          @keyframes hudIn {
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>
      </div>
    </>
  );
}

// ─── TopBar (Main Export) ────────────────────────────────────────────────────

export function TopBar() {
  const {
    isPlaying, togglePlayback,
    setLibraryModalOpen, libraryModalOpen,
    showShortcuts, setShowShortcuts,
  } = useEditorStore();

  return (
    <header
      id="top-bar"
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 12px',
        borderBottom: '1px solid var(--color-surface-border)',
        background: 'var(--color-bg-primary)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {showShortcuts && <ShortcutsHUD onClose={() => setShowShortcuts(false)} />}

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px hsla(247,74%,63%,0.3)',
          flexShrink: 0,
        }}>
          <Zap size={15} color="#fff" />
        </div>
        <span style={{
          fontWeight: 700, fontSize: '0.9rem',
          letterSpacing: '-0.02em', color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-display)',
        }}>
          Pelimotion
        </span>
      </div>

      <Divider />

      {/* Undo / Redo (visual-only for now) */}
      <TopBtn onClick={() => {}} title="Desfazer (em breve)">
        <Undo2 size={14} />
      </TopBtn>
      <TopBtn onClick={() => {}} title="Refazer (em breve)">
        <Redo2 size={14} />
      </TopBtn>

      <Divider />

      {/* Add Text */}
      <AddDropdown type="text" />

      {/* Add Element */}
      <AddDropdown type="element" />

      <Divider />

      {/* Play / Pause */}
      <TopBtn
        onClick={togglePlayback}
        title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
        active={isPlaying}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        <span style={{ fontSize: '0.7rem' }}>{isPlaying ? 'Pausar' : 'Preview'}</span>
      </TopBtn>

      <Divider />

      {/* Library */}
      <TopBtn
        onClick={() => setLibraryModalOpen(!libraryModalOpen)}
        title="Abrir Biblioteca de Assets"
        active={libraryModalOpen}
      >
        <BookOpen size={14} />
        <span>Biblioteca</span>
      </TopBtn>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Zoom Controls */}
      <ZoomControls />

      <Divider />

      {/* Keyboard Shortcuts Help */}
      <TopBtn onClick={() => setShowShortcuts(true)} title="Atalhos do teclado (?)">
        <HelpCircle size={14} />
      </TopBtn>
    </header>
  );
}
