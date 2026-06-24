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
  Settings,
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

// ─── TopBar (Main Export) ────────────────────────────────────────────────────

export function TopBar() {
  const {
    isPlaying, togglePlayback,
    setLibraryModalOpen, libraryModalOpen,
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
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px hsla(191,100%,50%,0.2)',
          flexShrink: 0,
        }}>
          <Zap size={15} color="#fff" />
        </div>
        <span style={{
          fontWeight: 700, fontSize: '0.9rem',
          letterSpacing: '-0.02em', color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
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

      {/* Settings shortcut */}
      <TopBtn onClick={() => window.open('/admin', '_blank')} title="Painel Admin">
        <Settings size={14} />
      </TopBtn>
    </header>
  );
}
