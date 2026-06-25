import { useEditorStore } from '@/store/useEditorStore';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, ScanLine, Sun, Moon, Grid } from 'lucide-react';


export function ViewportControls() {
  const store = useEditorStore();
  const {
    camera, setCamera, activeTypoLayerId, activeCompositionLayerId,
    updateTypoLayerTransform, updateCompositionLayer,
    canvasPreviewTheme, setCanvasPreviewTheme, showToast
  } = store;

  const zoomPercent = Math.round(camera.z * 100);

  const handleZoomIn  = () => setCamera({ z: Math.min(10, camera.z + 0.25) });
  const handleZoomOut = () => setCamera({ z: Math.max(0.1, camera.z - 0.25) });
  const handleZoom100 = () => setCamera({ z: 1, x: 0, y: 0 });
  const handleFit     = () => setCamera({ z: 1, x: 0, y: 0 });

  const handleResetTransforms = () => {
    if (activeTypoLayerId) {
      updateTypoLayerTransform(activeTypoLayerId, { x: 0, y: 0, scale: 1, rotation: 0 });
    }
    if (activeCompositionLayerId) {
      const layer = store.compositionLayers.find(l => l.id === activeCompositionLayerId);
      if (layer) {
        updateCompositionLayer(activeCompositionLayerId, {
          transform: { ...layer.transform, x: 0, y: 0, scale: 1, rotation: 0 },
        });
      }
    }
  };

  const zoomClass =
    zoomPercent > 110 ? 'zoomed-in' :
    zoomPercent < 90  ? 'zoomed-out' : '';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-surface-border)',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        userSelect: 'none',
      }}
    >
      {/* Zoom percentage display — color changes based on level */}
      <span
        key={zoomPercent}
        className={`zoom-counter ${zoomClass} animate-zoom-pop`}
        title="Current Zoom Level"
      >
        {zoomPercent}%
      </span>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="icon-btn-small btn-pressable"
        title="Zoom Out"
      >
        <ZoomOut size={15} />
      </button>

      {/* Reset to 100% */}
      <button
        onClick={handleZoom100}
        className="icon-btn-small text-btn btn-pressable"
        title="Zoom 100%"
        style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        100%
      </button>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="icon-btn-small btn-pressable"
        title="Zoom In"
      >
        <ZoomIn size={15} />
      </button>

      <div style={{ width: 1, height: 14, background: 'var(--color-surface-border)', margin: '0 3px' }} />

      {/* Fit to screen */}
      <button
        onClick={handleFit}
        className="icon-btn-small btn-pressable"
        title="Fit to Screen"
      >
        <Maximize size={15} />
      </button>

      {/* Canvas preview background switcher */}
      <button
        id="canvas-theme-toggle"
        onClick={() => {
          const themes: ('dark' | 'light' | 'transparent')[] = ['dark', 'light', 'transparent'];
          const currentIdx = themes.indexOf(canvasPreviewTheme);
          const nextTheme = themes[(currentIdx + 1) % themes.length]!;
          setCanvasPreviewTheme(nextTheme);
          showToast({
            type: 'info',
            title: `Visualização: Modo ${nextTheme === 'transparent' ? 'Transparente' : nextTheme === 'light' ? 'Claro' : 'Escuro'}`,
            message: 'Esta alteração afeta apenas o editor, não o arquivo final exportado.',
            duration: 2500
          });
        }}
        className="icon-btn-small btn-pressable"
        title="Alternar tema de fundo do Canvas (Escuro / Claro / Transparente)"
        style={{
          color: canvasPreviewTheme === 'light' ? '#ffaa00' : canvasPreviewTheme === 'transparent' ? '#00cc88' : 'var(--color-text-secondary)',
        }}
      >
        {canvasPreviewTheme === 'light' ? <Sun size={15} /> : canvasPreviewTheme === 'transparent' ? <Grid size={15} /> : <Moon size={15} />}
      </button>

      {/* Canvas grid/scan toggle hint */}
      <button
        className="icon-btn-small btn-pressable"
        title="Dica: Arraste com Espaço + Mouse para mover. Ctrl+Scroll para zoom preciso."
        style={{ color: 'var(--color-text-ghost)', cursor: 'default' }}
        onClick={() => {/* info only */}}
      >
        <ScanLine size={13} />
      </button>

      {/* Reset transforms (conditional) */}
      {(activeTypoLayerId || activeCompositionLayerId) && (
        <>
          <div style={{ width: 1, height: 14, background: 'var(--color-surface-border)', margin: '0 3px' }} />
          <button
            onClick={handleResetTransforms}
            className="icon-btn-small btn-pressable"
            title="Resetar transformações do elemento selecionado"
            style={{ color: 'var(--color-warning)' }}
          >
            <RotateCcw size={15} />
          </button>
        </>
      )}
    </div>
  );
}
