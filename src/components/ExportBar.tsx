/**
 * ExportBar — Pelimotion v3.0
 *
 * Simplified export control bar at the bottom of the editor.
 * Replaces the separate Composition + Export panels with a single,
 * clean, always-visible export strip.
 */
import React, { useState, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { runExportPipeline } from '@/engines/Export/exportPipeline';
import {
  Download, Square, ChevronDown, Loader2, X, Check,
  Monitor, Smartphone,
} from 'lucide-react';

// ─── Aspect Ratio Config ─────────────────────────────────────────────────────

const ASPECT_RATIOS = [
  { id: '16:9' as const, label: '16:9', sublabel: 'Widescreen / YouTube', icon: <Monitor size={13} /> },
  { id: '9:16' as const, label: '9:16', sublabel: 'Stories / Reels / TikTok', icon: <Smartphone size={13} /> },
  { id: '1:1' as const, label: '1:1', sublabel: 'Feed Quadrado', icon: <Square size={13} /> },
  { id: '4:5' as const, label: '4:5', sublabel: 'Feed Portrait Instagram', icon: <Smartphone size={13} /> },
];

// ─── Format Config ───────────────────────────────────────────────────────────

const FORMATS = [
  { value: 'mp4' as const, label: 'MP4', sublabel: 'Vídeo para redes sociais' },
  { value: 'mov' as const, label: 'MOV Alpha', sublabel: 'Transparência p/ edição' },
  { value: 'png-sequence' as const, label: 'PNG Seq', sublabel: 'Frames em ZIP' },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Dropdown({ trigger, children, open, onToggle }: {
  trigger: React.ReactNode; children: React.ReactNode; open: boolean; onToggle: () => void;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={onToggle} style={{ cursor: 'pointer' }}>{trigger}</div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={onToggle} />
          <div style={{
            position: 'absolute', bottom: '100%', left: 0,
            marginBottom: 8, zIndex: 999,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 -16px 48px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            minWidth: 220,
          }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ExportBar (Main Export) ─────────────────────────────────────────────────

export function ExportBar() {
  const {
    exportConfig, exportState, updateExportConfig,
    setExportState, resetExport, setAspectRatio, activeAspectRatio,
  } = useEditorStore();

  const [ratioOpen, setRatioOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const abortRef = useRef(false);

  const isExporting = exportState.isExporting;
  const progress = exportState.progress;
  const currentFormat = FORMATS.find(f => f.value === exportConfig.format) ?? FORMATS[0]!;
  const currentRatio = ASPECT_RATIOS.find(r => r.id === activeAspectRatio) ?? ASPECT_RATIOS[0]!;

  const handleExport = async () => {
    if (isExporting) {
      // Cancel
      abortRef.current = true;
      setExportState({ isExporting: false, stage: 'idle', progress: 0 });
      return;
    }
    abortRef.current = false;
    try {
      const element = document.getElementById('canvas-fixed-resolution') as HTMLElement;
      if (!element) throw new Error('Canvas element not found');
      const { exportConfig: cfg } = useEditorStore.getState();
      await runExportPipeline(
        element,
        cfg,
        (s) => setExportState(s),
      );
    } catch (e: any) {
      if (e?.message !== 'EXPORT_CANCELLED') {
        setExportState({ stage: 'error', errorMessage: String(e?.message), isExporting: false });
        setTimeout(() => resetExport(), 4000);
      }
    }
  };

  return (
    <div
      id="export-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderTop: '1px solid var(--color-surface-border)',
        background: 'var(--color-bg-secondary)',
        position: 'relative',
      }}
    >
      {/* Progress fill */}
      {isExporting && (
        <div style={{
          position: 'absolute', inset: 0, left: 0, top: 0,
          width: `${progress}%`, height: '100%',
          background: 'hsla(191, 100%, 50%, 0.05)',
          transition: 'width 0.3s ease',
          pointerEvents: 'none',
        }} />
      )}

      {/* Aspect Ratio Selector */}
      <Dropdown
        open={ratioOpen}
        onToggle={() => { setRatioOpen(!ratioOpen); setFormatOpen(false); }}
        trigger={
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 7,
            border: '1px solid var(--color-surface-border)',
            background: 'hsla(0,0%,100%,0.04)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.72rem', fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer', userSelect: 'none',
            transition: 'all 0.15s ease',
          }}>
            {currentRatio.icon}
            <span>{activeAspectRatio === 'none' ? 'Proporção' : currentRatio.label}</span>
            <ChevronDown size={11} />
          </div>
        }
      >
        <div style={{ padding: 6 }}>
          <div style={{ padding: '6px 10px 4px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-ghost)' }}>
            Proporção
          </div>
          {ASPECT_RATIOS.map(r => (
            <button key={r.id} onClick={() => { setAspectRatio(r.id); setRatioOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none',
                background: activeAspectRatio === r.id ? 'hsla(191,100%,50%,0.08)' : 'transparent',
                color: activeAspectRatio === r.id ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => { if (activeAspectRatio !== r.id) e.currentTarget.style.background = 'hsla(0,0%,100%,0.04)'; }}
              onMouseLeave={(e) => { if (activeAspectRatio !== r.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ color: 'inherit', display: 'flex' }}>{r.icon}</span>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--color-text-ghost)', marginTop: 1 }}>{r.sublabel}</div>
              </div>
              {activeAspectRatio === r.id && <Check size={13} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Format Selector */}
      <Dropdown
        open={formatOpen}
        onToggle={() => { setFormatOpen(!formatOpen); setRatioOpen(false); }}
        trigger={
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 7,
            border: '1px solid var(--color-surface-border)',
            background: 'hsla(0,0%,100%,0.04)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.72rem', fontWeight: 500,
            fontFamily: 'var(--font-sans)', cursor: 'pointer', userSelect: 'none',
          }}>
            <span>{currentFormat.label}</span>
            <ChevronDown size={11} />
          </div>
        }
      >
        <div style={{ padding: 6 }}>
          <div style={{ padding: '6px 10px 4px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-ghost)' }}>
            Formato
          </div>
          {FORMATS.map(f => (
            <button key={f.value} onClick={() => { updateExportConfig({ format: f.value }); setFormatOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none',
                background: exportConfig.format === f.value ? 'hsla(191,100%,50%,0.08)' : 'transparent',
                color: exportConfig.format === f.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => { if (exportConfig.format !== f.value) e.currentTarget.style.background = 'hsla(0,0%,100%,0.04)'; }}
              onMouseLeave={(e) => { if (exportConfig.format !== f.value) e.currentTarget.style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{f.label}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--color-text-ghost)', marginTop: 1 }}>{f.sublabel}</div>
              </div>
              {exportConfig.format === f.value && <Check size={13} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      </Dropdown>

      {/* Duration */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 8px', borderRadius: 7,
        border: '1px solid var(--color-surface-border)',
        background: 'hsla(0,0%,100%,0.03)',
      }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-ghost)' }}>Dur</span>
        <input
          type="number" min={1} max={60} step={0.5}
          value={exportConfig.duration}
          onChange={(e) => updateExportConfig({ duration: parseFloat(e.target.value) || 5 })}
          style={{
            background: 'none', border: 'none', outline: 'none', width: 36,
            color: 'var(--color-text-primary)', fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)', textAlign: 'center',
          }}
        />
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-ghost)' }}>s</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Progress text */}
      {isExporting && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Loader2 size={13} color="var(--color-accent)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {Math.round(progress)}%
          </span>
          {exportState.stage === 'capturing' && <span style={{ fontSize: '0.65rem', color: 'var(--color-text-ghost)' }}>Capturando frames…</span>}
          {exportState.stage === 'encoding' && <span style={{ fontSize: '0.65rem', color: 'var(--color-text-ghost)' }}>Codificando…</span>}
        </div>
      )}

      {exportState.stage === 'error' && (
        <span style={{ fontSize: '0.65rem', color: 'hsla(0,80%,65%,1)' }}>
          ⚠ Erro na exportação
        </span>
      )}

      {/* Export CTA Button */}
      <button
        id="export-btn"
        onClick={handleExport}
        disabled={exportState.stage === 'complete'}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 18px', borderRadius: 8, border: 'none',
          cursor: isExporting ? 'pointer' : 'pointer',
          fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
          transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
          position: 'relative', overflow: 'hidden',
          ...(isExporting ? {
            background: 'hsla(0,70%,50%,0.12)',
            color: 'hsla(0,80%,65%,1)',
            boxShadow: 'inset 0 0 0 1px hsla(0,70%,50%,0.3)',
          } : {
            background: 'linear-gradient(135deg, var(--color-accent), hsla(271,76%,53%,1))',
            color: '#fff',
            boxShadow: '0 4px 20px hsla(191,100%,50%,0.25)',
          }),
        }}
        onMouseEnter={(e) => { if (!isExporting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
      >
        {isExporting ? (
          <><X size={14} /> Cancelar</>
        ) : (
          <><Download size={14} /> Exportar {currentFormat.label}</>
        )}
      </button>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
