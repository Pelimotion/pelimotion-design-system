import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, Plus, Trash2, Film } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import type { CompositionLayer } from '@/types/motion.types';

export function CompositionTimeline() {
  const { 
    compositionLayers, 
    removeCompositionLayer, 
    updateCompositionLayer,
    addCompositionLayer,
    localLibraryItems,
    exportConfig,
    updateExportConfig
  } = useEditorStore();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction State
  const [dragging, setDragging] = useState<{ id: string, type: 'move' | 'trim-left' | 'trim-right', isBg?: boolean } | null>(null);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(10); // default

  // Update scale based on container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPixelsPerSecond(entry.contentRect.width / exportConfig.duration);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [exportConfig.duration]);

  const handleAddLocalItem = (item: any) => {
    const newLayer: CompositionLayer = {
      id: crypto.randomUUID(),
      name: item.name || `Layer ${compositionLayers.length + 1}`,
      type: 'localAsset',
      assetId: item.id,
      startTime: 0,
      duration: Math.min(3, exportConfig.duration),
      transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    };
    addCompositionLayer(newLayer);
    setShowAddMenu(false);
  };

  // --- Pointer Event Handlers ---
  const handlePointerDown = (e: React.PointerEvent, id: string, type: 'move' | 'trim-left' | 'trim-right', isBg?: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ id, type, isBg });
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const time = Math.max(0, Math.min(exportConfig.duration, mouseX / pixelsPerSecond));

    if (dragging.isBg) {
       // Background Video Trim
       const trimStart = exportConfig.bgTrimStart || 0;
       const trimEnd = exportConfig.bgTrimEnd || exportConfig.duration; // Fallback
       
       if (dragging.type === 'trim-left') {
         updateExportConfig({ bgTrimStart: Math.min(time, trimEnd - 0.1) });
       } else if (dragging.type === 'trim-right') {
         updateExportConfig({ bgTrimEnd: Math.max(time, trimStart + 0.1) });
       }
    } else {
       // Composition Layer
       const layer = compositionLayers.find(l => l.id === dragging.id);
       if (!layer) return;

       if (dragging.type === 'move') {
          updateCompositionLayer(dragging.id, { startTime: Math.min(time, exportConfig.duration - layer.duration) });
       } else if (dragging.type === 'trim-left') {
          const endTime = layer.startTime + layer.duration;
          const newStart = Math.min(time, endTime - 0.1);
          updateCompositionLayer(dragging.id, { startTime: newStart, duration: endTime - newStart });
       } else if (dragging.type === 'trim-right') {
          const newDur = Math.max(0.1, time - layer.startTime);
          updateCompositionLayer(dragging.id, { duration: newDur });
       }
    }
  }, [dragging, pixelsPerSecond, exportConfig, compositionLayers, updateExportConfig, updateCompositionLayer]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  // Track rendering styles
  const trackStyle: React.CSSProperties = {
    height: 32,
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-surface-border)',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 8
  };

  const blockStyle = (start: number, dur: number, bg?: string): React.CSSProperties => ({
    position: 'absolute',
    left: `${(start / exportConfig.duration) * 100}%`,
    width: `${(dur / exportConfig.duration) * 100}%`,
    height: '100%',
    background: bg || 'var(--color-surface-glass)',
    border: '1px solid var(--color-accent)',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    cursor: dragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    touchAction: 'none'
  });

  const handleStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    [side]: 0,
    top: 0,
    bottom: 0,
    width: 8,
    background: 'rgba(255,255,255,0.2)',
    cursor: 'col-resize',
    zIndex: 10
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} color="var(--color-accent)" /> Linha do Tempo
        </h3>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: '0.7rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Plus size={12} /> Adicionar Peça
        </button>
      </div>

      {showAddMenu && (
        <div style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-surface-border)',
          borderRadius: 8,
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxHeight: 150,
          overflowY: 'auto'
        }}>
          {localLibraryItems.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', padding: 4 }}>
              Nenhum item na biblioteca local. Crie itens em Tipografia ou Generativo e salve-os.
            </div>
          ) : (
            localLibraryItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleAddLocalItem(item)}
                style={{
                  background: 'none',
                  border: '1px solid transparent',
                  color: 'var(--color-text-primary)',
                  padding: '6px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  borderRadius: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-surface-border)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}
              >
                <span>{item.name}</span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase' }}>{item.type}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* TIMELINE AREA */}
      <div 
        ref={containerRef}
        style={{ 
          background: 'var(--color-bg-elevated)', 
          border: '1px solid var(--color-surface-border)', 
          borderRadius: 8, 
          padding: '12px 12px 24px 12px',
          position: 'relative'
        }}
      >
        {/* Timeline Axis */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--color-text-ghost)', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: 4 }}>
          <span>0s</span>
          <span>{exportConfig.duration}s</span>
        </div>

        {/* Master Background Track (If Video) */}
        {exportConfig.backgroundType === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 12 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Film size={10} /> Mestre: Background Vídeo
            </div>
            <div style={trackStyle}>
               <div 
                  style={blockStyle(exportConfig.bgTrimStart || 0, (exportConfig.bgTrimEnd || exportConfig.duration) - (exportConfig.bgTrimStart || 0), 'rgba(255, 100, 50, 0.2)')}
                  onPointerDown={(e) => handlePointerDown(e, 'bg', 'move', true)}
               >
                 <div style={handleStyle('left')} onPointerDown={(e) => handlePointerDown(e, 'bg', 'trim-left', true)} />
                 <span style={{ margin: '0 auto', fontSize: '0.65rem', color: 'white', opacity: 0.8 }}>TRIM</span>
                 <div style={handleStyle('right')} onPointerDown={(e) => handlePointerDown(e, 'bg', 'trim-right', true)} />
               </div>
            </div>
          </div>
        )}

        {/* Composition Layers Tracks */}
        {compositionLayers.length === 0 && exportConfig.backgroundType !== 'video' ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.75rem', color: 'var(--color-text-ghost)' }}>
            Nenhuma camada de vídeo ou composição na Timeline.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {compositionLayers.map((layer, index) => (
              <div key={layer.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
                  <span>Track {index + 1}: {layer.name}</span>
                  <button onClick={() => removeCompositionLayer(layer.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 2 }}>
                    <Trash2 size={10} />
                  </button>
                </div>
                <div style={trackStyle}>
                   <div 
                      style={blockStyle(layer.startTime, layer.duration, 'rgba(0, 150, 255, 0.2)')}
                      onPointerDown={(e) => handlePointerDown(e, layer.id, 'move')}
                   >
                     <div style={handleStyle('left')} onPointerDown={(e) => handlePointerDown(e, layer.id, 'trim-left')} />
                     <span style={{ margin: '0 auto', fontSize: '0.65rem', color: 'white', opacity: 0.8 }}>
                       {layer.startTime.toFixed(1)}s - {(layer.startTime + layer.duration).toFixed(1)}s
                     </span>
                     <div style={handleStyle('right')} onPointerDown={(e) => handlePointerDown(e, layer.id, 'trim-right')} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
