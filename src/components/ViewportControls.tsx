import { useEditorStore } from '@/store/useEditorStore';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

export function ViewportControls() {
  const store = useEditorStore();
  const { camera, setCamera, activeTypoLayerId, activeCompositionLayerId, updateTypoLayerTransform, updateCompositionLayer } = store;

  const handleZoomIn = () => setCamera({ z: Math.min(10, camera.z + 0.25) });
  const handleZoomOut = () => setCamera({ z: Math.max(0.1, camera.z - 0.25) });
  const handleZoom100 = () => setCamera({ z: 1, x: 0, y: 0 });
  const handleFit = () => {
    // Reset camera fully. The base scale calculation in App.tsx will handle fitting it to the screen.
    setCamera({ z: 1, x: 0, y: 0 });
  };

  const handleResetTransforms = () => {
    if (activeTypoLayerId) {
      updateTypoLayerTransform(activeTypoLayerId, { x: 0, y: 0, scale: 1, rotation: 0 });
    }
    if (activeCompositionLayerId) {
      const layer = store.compositionLayers.find(l => l.id === activeCompositionLayerId);
      if (layer) {
        updateCompositionLayer(activeCompositionLayerId, { transform: { ...layer.transform, x: 0, y: 0, scale: 1, rotation: 0 } });
      }
    }
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-surface-border)',
      borderRadius: 'var(--radius-full)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      zIndex: 50,
      backdropFilter: 'blur(10px)',
    }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginRight: 8, userSelect: 'none', minWidth: 40 }}>
        {Math.round(camera.z * 100)}%
      </span>
      
      <button onClick={handleZoomOut} className="icon-btn-small" title="Zoom Out">
        <ZoomOut size={16} />
      </button>
      
      <button onClick={handleZoom100} className="icon-btn-small text-btn" title="100% Zoom" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
        100%
      </button>
      
      <button onClick={handleZoomIn} className="icon-btn-small" title="Zoom In">
        <ZoomIn size={16} />
      </button>

      <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />

      <button onClick={handleFit} className="icon-btn-small" title="Fit to Screen">
        <Maximize size={16} />
      </button>

      {(activeTypoLayerId || activeCompositionLayerId) && (
        <>
          <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />
          <button onClick={handleResetTransforms} className="icon-btn-small" title="Reset Transform (Fix Inversions)" style={{ color: 'var(--color-warning)' }}>
            <RotateCcw size={16} />
          </button>
        </>
      )}
    </div>
  );
}
