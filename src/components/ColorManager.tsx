import { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { Palette, ArrowLeftRight } from 'lucide-react';

export function ColorManager() {
  const { applyColorPalette } = useEditorStore();
  const [invert, setInvert] = useState(false);
  const [activePaletteId, setActivePaletteId] = useState(COLOR_PALETTES[0]?.id || '');

  const handlePaletteSelect = (paletteId: string) => {
    setActivePaletteId(paletteId);
    const palette = COLOR_PALETTES.find(p => p.id === paletteId);
    if (palette) {
      applyColorPalette(palette, { invert });
    }
  };

  const toggleInvert = () => {
    const newInvert = !invert;
    setInvert(newInvert);
    const palette = COLOR_PALETTES.find(p => p.id === activePaletteId);
    if (palette) {
      applyColorPalette(palette, { invert: newInvert });
    }
  };

  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palette size={16} color="var(--color-text-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Paletas de Cores</span>
        </div>
        <button
          onClick={toggleInvert}
          style={{
            background: invert ? 'var(--color-surface-hover)' : 'transparent',
            border: '1px solid var(--color-surface-border)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.7rem',
            color: invert ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        >
          <ArrowLeftRight size={12} />
          {invert ? 'Invertido' : 'Inverter'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {COLOR_PALETTES.map(p => {
          const isActive = activePaletteId === p.id;
          const p1 = invert ? p.secondary : p.primary;
          const p2 = invert ? p.primary : p.secondary;
          return (
            <div
              key={p.id}
              onClick={() => handlePaletteSelect(p.id)}
              style={{
                background: p.background,
                border: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 0 0 2px var(--color-bg-primary)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p1 }}>{p.name}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ flex: 1, height: 16, background: p1, borderRadius: 4 }} />
                <div style={{ flex: 1, height: 16, background: p2, borderRadius: 4 }} />
                <div style={{ flex: 1, height: 16, background: p.accent, borderRadius: 4 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
