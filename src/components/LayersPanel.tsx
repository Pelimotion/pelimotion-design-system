/**
 * LayersPanel — Pelimotion v3.0
 *
 * Unified layer list panel (left side of editor, Figma-style).
 * Shows all universal layers (text + elements) in a single ordered list.
 * Supports visibility toggle, lock, selection, and drag-to-reorder.
 */
import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { UniversalLayer, UniversalLayerType } from '@/types/universalLayers.types';
import { createTextLayer, createElementLayer, createOverlayLayer, createShadowGuardLayer, createTextBoxLayer } from '@/types/universalLayers.types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Layers,
  Plus,
  Copy,
  Trash2,
  ChevronDown,
  Shield,
  Square,
  ImageIcon,
  GripVertical,
} from 'lucide-react';

// ─── Layer Type Config ───────────────────────────────────────────────────────

const LAYER_TYPE_CONFIG: Record<UniversalLayerType, { icon: React.ReactNode; color: string; label: string }> = {
  text: { icon: <Type size={13} />, color: 'hsla(191, 100%, 50%, 0.8)', label: 'Texto' },
  element: { icon: <Layers size={13} />, color: 'hsla(271, 76%, 53%, 0.8)', label: 'Elemento' },
  overlay: { icon: <ImageIcon size={13} />, color: 'hsla(45, 100%, 60%, 0.8)', label: 'Overlay' },
  'shadow-guard': { icon: <Shield size={13} />, color: 'hsla(0, 0%, 60%, 0.8)', label: 'Proteção' },
  'text-box': { icon: <Square size={13} />, color: 'hsla(330, 80%, 60%, 0.8)', label: 'Caixa' },
};

// ─── Layer Item Component ────────────────────────────────────────────────────

interface LayerItemProps {
  layer: UniversalLayer;
  isSelected: boolean;
  onSelect: () => void;
}

function LayerItem({ layer, isSelected, onSelect }: LayerItemProps) {
  const { updateLayer } = useEditorStore();
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const config = LAYER_TYPE_CONFIG[layer.type];

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { visible: !layer.visible });
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(layer.id, { locked: !layer.locked });
  };

  const handleNameSubmit = () => {
    setEditing(false);
    if (editName.trim() && editName !== layer.name) {
      updateLayer(layer.id, { name: editName.trim() });
    } else {
      setEditName(layer.name);
    }
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 8px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        background: isSelected
          ? 'hsla(191, 100%, 50%, 0.08)'
          : hovered
          ? 'hsla(0, 0%, 100%, 0.03)'
          : 'transparent',
        border: isSelected
          ? '1px solid hsla(191, 100%, 50%, 0.2)'
          : '1px solid transparent',
        opacity: layer.visible ? 1 : 0.4,
        minHeight: 36,
      }}
    >
      {/* Drag Handle */}
      <div style={{ color: 'var(--color-text-ghost)', cursor: 'grab', flexShrink: 0, opacity: hovered ? 0.6 : 0 }}>
        <GripVertical size={12} />
      </div>

      {/* Type Badge */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          background: `${config.color}15`,
          border: `1px solid ${config.color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.color,
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {editing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') { setEditName(layer.name); setEditing(false); }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'hsla(0,0%,100%,0.06)',
              border: '1px solid var(--color-accent)',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: '0.72rem',
              color: 'var(--color-text-primary)',
              width: '100%',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
        ) : (
          <span
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
            style={{
              fontSize: '0.72rem',
              fontWeight: isSelected ? 600 : 400,
              color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
          >
            {layer.name}
          </span>
        )}
      </div>

      {/* Actions (visible on hover or selection) */}
      {(hovered || isSelected) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button
            onClick={handleToggleVisibility}
            title={layer.visible ? 'Ocultar' : 'Mostrar'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 3,
              color: layer.visible ? 'var(--color-text-muted)' : 'var(--color-text-ghost)',
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            onClick={handleToggleLock}
            title={layer.locked ? 'Desbloquear' : 'Bloquear'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 3,
              color: layer.locked ? 'var(--color-accent)' : 'var(--color-text-ghost)',
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add Layer Dropdown ──────────────────────────────────────────────────────

function AddLayerDropdown() {
  const { addLayer } = useEditorStore();
  const [open, setOpen] = useState(false);

  const items = [
    { label: 'Texto', icon: <Type size={14} />, action: () => addLayer(createTextLayer()) },
    { label: 'Forma / SVG', icon: <Layers size={14} />, action: () => addLayer(createElementLayer()) },
    { label: 'Overlay', icon: <ImageIcon size={14} />, action: () => addLayer(createOverlayLayer()) },
    { label: 'Proteção de Texto', icon: <Shield size={14} />, action: () => addLayer(createShadowGuardLayer()) },
    { label: 'Caixa de Texto', icon: <Square size={14} />, action: () => addLayer(createTextBoxLayer()) },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '5px 10px',
          borderRadius: 7,
          border: '1px solid var(--color-surface-border)',
          background: 'hsla(0, 0%, 100%, 0.04)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          fontSize: '0.72rem',
          fontWeight: 500,
          fontFamily: 'var(--font-sans)',
          transition: 'all 0.15s ease',
          width: '100%',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'hsla(191, 100%, 50%, 0.08)';
          e.currentTarget.style.borderColor = 'hsla(191, 100%, 50%, 0.3)';
          e.currentTarget.style.color = 'var(--color-accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.04)';
          e.currentTarget.style.borderColor = 'var(--color-surface-border)';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        <Plus size={14} />
        <span>Adicionar Elemento</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 10,
              padding: 4,
              zIndex: 999,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                onClick={() => { item.action(); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 7,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.1s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.06)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── LayersPanel (Main Export) ────────────────────────────────────────────────

export function LayersPanel() {
  const {
    layers,
    selectedLayerId,
    setSelectedLayerId,
    removeLayer,
    duplicateLayer,
  } = useEditorStore();

  // Reverse order so topmost layer is at top of list (like Figma)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 12px 8px',
        borderBottom: '1px solid var(--color-surface-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}>
          Elementos
        </span>
        <span style={{
          fontSize: '0.65rem',
          color: 'var(--color-text-ghost)',
          fontFamily: 'var(--font-mono)',
        }}>
          {layers.length}
        </span>
      </div>

      {/* Layer List */}
      <div
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 6px',
        }}
      >
        {sortedLayers.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 16px',
            gap: 12,
            textAlign: 'center',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'hsla(191, 100%, 50%, 0.06)',
              border: '1px solid hsla(191, 100%, 50%, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-ghost)',
            }}>
              <Layers size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                Escolha um elemento para começar
              </p>
              <p style={{ fontSize: '0.68rem', color: 'var(--color-text-ghost)', lineHeight: 1.4 }}>
                Adicione textos e elementos para começar a criar
              </p>
            </div>
          </div>
        ) : (
          sortedLayers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isSelected={selectedLayerId === layer.id}
              onSelect={() => setSelectedLayerId(layer.id)}
            />
          ))
        )}
      </div>

      {/* Selected Layer Quick Actions */}
      {selectedLayerId && (
        <div style={{
          padding: '6px 8px',
          borderTop: '1px solid var(--color-surface-border)',
          display: 'flex',
          gap: 4,
          justifyContent: 'center',
        }}>
          <button
            onClick={() => duplicateLayer(selectedLayerId)}
            title="Duplicar elemento"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 5, border: 'none',
              background: 'hsla(0,0%,100%,0.04)', color: 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(0,0%,100%,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'hsla(0,0%,100%,0.04)'}
          >
            <Copy size={12} /> Duplicar
          </button>
          <button
            onClick={() => removeLayer(selectedLayerId)}
            title="Deletar elemento"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 5, border: 'none',
              background: 'hsla(0,70%,50%,0.06)', color: 'hsla(0,80%,65%,1)',
              cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(0,70%,50%,0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'hsla(0,70%,50%,0.06)'}
          >
            <Trash2 size={12} /> Deletar
          </button>
        </div>
      )}

      {/* Add Layer Button */}
      <div style={{ padding: '8px 8px 12px' }}>
        <AddLayerDropdown />
      </div>
    </div>
  );
}
