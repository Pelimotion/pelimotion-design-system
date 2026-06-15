import { useEditorStore } from '@/store/useEditorStore';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, ScanLine } from 'lucide-react';

export function ViewportControls() {
  const store = useEditorStore();
  const { camera, setCamera, activeTypoLayerId, activeCompositionLayerId, updateTypoLayerTransform, updateCompositionLayer } = store;

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
        className={`zoom-counter ${zoomClass}`}
        title="Nível de zoom atual"
      >
        {zoomPercent}%
      </span>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="icon-btn-small btn-pressable"
        title="Diminuir zoom  –"
      >
        <ZoomOut size={15} />
      </button>

      {/* Reset to 100% */}
      <button
        onClick={handleZoom100}
        className="icon-btn-small text-btn btn-pressable"
        title="Zoom 100%  0"
        style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        100%
      </button>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="icon-btn-small btn-pressable"
        title="Aumentar zoom  +"
      >
        <ZoomIn size={15} />
      </button>

      <div style={{ width: 1, height: 14, background: 'var(--color-surface-border)', margin: '0 3px' }} />

      {/* Fit to screen */}
      <button
        onClick={handleFit}
        className="icon-btn-small btn-pressable"
        title="Ajustar à tela  Cmd+Shift+H"
      >
        <Maximize size={15} />
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
            title="Resetar transformações da camada selecionada"
            style={{ color: 'var(--color-warning)' }}
          >
            <RotateCcw size={15} />
          </button>
        </>
      )}
    </div>
  );
}
