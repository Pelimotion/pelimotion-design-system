import { useEditorStore } from '@/store/useEditorStore';
import { Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export function FloatingToolbar() {
  const {
    activeCompositionLayerId,
    compositionLayers,
    removeCompositionLayer,
    addCompositionLayer,
    reorderCompositionLayers,
    setActiveCompositionLayerId,
  } = useEditorStore();

  if (!activeCompositionLayerId) return null;

  const activeIndex = compositionLayers.findIndex(l => l.id === activeCompositionLayerId);
  const activeLayer = compositionLayers[activeIndex];

  if (!activeLayer) return null;

  const handleDuplicate = () => {
    const newId = crypto.randomUUID();
    const duplicatedLayer = {
      ...activeLayer,
      id: newId,
      name: `${activeLayer.name} Copy`,
      transform: {
        ...activeLayer.transform,
        x: activeLayer.transform.x + 20,
        y: activeLayer.transform.y + 20,
      }
    };
    addCompositionLayer(duplicatedLayer);
    setActiveCompositionLayerId(newId);
  };

  const handleDelete = () => {
    removeCompositionLayer(activeCompositionLayerId);
  };

  const handleBringForward = () => {
    if (activeIndex < compositionLayers.length - 1) {
      reorderCompositionLayers(activeIndex, activeIndex + 1);
    }
  };

  const handleSendBackward = () => {
    if (activeIndex > 0) {
      reorderCompositionLayers(activeIndex, activeIndex - 1);
    }
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translate(-50%, -12px) scale(var(--inverse-scale, 1))',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px',
        borderRadius: '8px',
        pointerEvents: 'auto',
        boxShadow: 'var(--shadow-elevated)',
        whiteSpace: 'nowrap',
      }}
      onPointerDown={(e) => e.stopPropagation()} // Prevent gizmo drag from triggering
    >
      <button className="icon-button" onClick={handleBringForward} disabled={activeIndex === compositionLayers.length - 1} title="Bring Forward">
        <ChevronUp size={14} />
      </button>
      <button className="icon-button" onClick={handleSendBackward} disabled={activeIndex === 0} title="Send Backward">
        <ChevronDown size={14} />
      </button>
      
      <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />
      
      <button className="icon-button" onClick={handleDuplicate} title="Duplicate">
        <Copy size={14} />
      </button>
      <button className="icon-button" onClick={handleDelete} title="Delete" style={{ color: 'var(--color-error)' }}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}
