import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, Plus, Trash2, Film, ChevronUp, ChevronDown, Play, Pause, SkipBack, Music, Volume2, VolumeX, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import type { CompositionLayer, AudioTrack } from '@/types/motion.types';

export function CompositionTimeline() {
  const { 
    compositionLayers, 
    audioTracks,
    removeCompositionLayer, 
    updateCompositionLayer,
    addCompositionLayer,
    addAudioTrack,
    removeAudioTrack,
    updateAudioTrack,
    localLibraryItems,
    exportConfig,
    updateExportConfig,
    currentTime,
    seek,
    reorderCompositionLayers,
    isPlaying,
    togglePlayback
  } = useEditorStore();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [timelineZoom, setTimelineZoom] = useState(100);
  
  // Interaction State
  const [dragging, setDragging] = useState<{ id: string, type: 'move' | 'trim-left' | 'trim-right' | 'playhead', isBg?: boolean, isAudio?: boolean } | null>(null);
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

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const src = URL.createObjectURL(file);
    const tempAudio = new Audio(src);
    
    tempAudio.onloadedmetadata = () => {
      const duration = tempAudio.duration;
      const newAudioTrack: AudioTrack = {
        id: crypto.randomUUID(),
        name: file.name,
        src: src,
        startTime: 0,
        duration: Math.min(duration, exportConfig.duration),
        volume: 0.5,
      };
      addAudioTrack(newAudioTrack);
    };
    
    // Reset input
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  // --- Pointer Event Handlers ---
  const handlePointerDown = (e: React.PointerEvent, id: string, type: 'move' | 'trim-left' | 'trim-right', isBg?: boolean, isAudio?: boolean) => {
    if (isAudio) {
      const track = audioTracks.find(t => t.id === id);
      if (track?.locked) return;
    } else if (!isBg) {
      const layer = compositionLayers.find(l => l.id === id);
      if (layer?.locked) return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    setDragging({ id, type, isBg, isAudio });
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Offset by the padding (12px) where the timeline starts
    const mouseX = e.clientX - (rect.left + 12);
    // Add extra width protection to avoid going outside
    const trackWidth = rect.width - 24; 
    const time = Math.max(0, Math.min(exportConfig.duration, (mouseX / trackWidth) * exportConfig.duration));

    if (dragging.type === 'playhead') {
      seek(time);
      import('gsap').then(({ gsap }) => {
        gsap.globalTimeline.pause();
        gsap.globalTimeline.seek(time);
      });
      return;
    }

    if (dragging.isBg) {
       // Background Video Trim
       const trimStart = exportConfig.bgTrimStart || 0;
       const trimEnd = exportConfig.bgTrimEnd || exportConfig.duration; // Fallback
       
       if (dragging.type === 'trim-left') {
         updateExportConfig({ bgTrimStart: Math.min(time, trimEnd - 0.1) });
       } else if (dragging.type === 'trim-right') {
         updateExportConfig({ bgTrimEnd: Math.max(time, trimStart + 0.1) });
       }
    } else if (dragging.isAudio) {
       const track = audioTracks.find(t => t.id === dragging.id);
       if (!track) return;

       if (dragging.type === 'move') {
          updateAudioTrack(dragging.id, { startTime: Math.min(time, exportConfig.duration - track.duration) });
       } else if (dragging.type === 'trim-left') {
          const endTime = track.startTime + track.duration;
          const newStart = Math.min(time, endTime - 0.1);
          updateAudioTrack(dragging.id, { startTime: newStart, duration: endTime - newStart });
       } else if (dragging.type === 'trim-right') {
          const newDur = Math.max(0.1, time - track.startTime);
          updateAudioTrack(dragging.id, { duration: newDur });
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
  }, [dragging, pixelsPerSecond, exportConfig, compositionLayers, audioTracks, updateExportConfig, updateCompositionLayer, updateAudioTrack, seek]);

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

  const handleTimelinePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - (rect.left + 12);
    const trackWidth = rect.width - 24;
    const time = Math.max(0, Math.min(exportConfig.duration, (mouseX / trackWidth) * exportConfig.duration));
    seek(time);
    import('gsap').then(({ gsap }) => {
      gsap.globalTimeline.pause();
      gsap.globalTimeline.seek(time);
    });
    setDragging({ id: 'playhead', type: 'playhead' });
  };

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

  const getHandleClass = (id: string, type: 'trim-left' | 'trim-right', side: 'left' | 'right') => {
    const isActive = dragging?.id === id && dragging?.type === type;
    return `timeline-trim-handle ${side} ${isActive ? 'active' : ''}`;
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
    marginBottom: 6, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-accent)',
    padding: '4px 8px', borderRadius: 4, fontSize: '0.65rem', color: 'white', whiteSpace: 'nowrap',
    zIndex: 100, boxShadow: 'var(--shadow-glow)', fontWeight: 600, fontFamily: 'var(--font-mono)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} color="var(--color-accent)" /> Linha do Tempo
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => seek(0)}
            style={{
              background: 'var(--color-surface-glass)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 4,
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Voltar ao Início"
          >
            <SkipBack size={12} />
          </button>
          <button
            onClick={togglePlayback}
            style={{
              background: isPlaying ? 'var(--color-surface-glass)' : 'var(--color-accent)',
              color: isPlaying ? 'var(--color-text-primary)' : '#fff',
              border: '1px solid ' + (isPlaying ? 'var(--color-surface-border)' : 'transparent'),
              borderRadius: 4,
              padding: '4px 12px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? 'Pausar' : 'Play'}
          </button>
          
          <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />

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
          
          <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-glass)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-surface-border)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Zoom:</span>
            <input
              type="range"
              min="100" max="500"
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(Number(e.target.value))}
              style={{ width: 50, outline: 'none' }}
            />
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-glass)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-surface-border)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Duração (s):</span>
            <input
              type="number"
              min="1" max="120"
              value={exportConfig.duration}
              onChange={(e) => updateExportConfig({ duration: Number(e.target.value) || 5 })}
              style={{
                background: 'transparent', border: 'none', color: 'var(--color-text-primary)', width: 30, fontSize: '0.7rem', outline: 'none', textAlign: 'center'
              }}
            />
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />

          <input
            type="file"
            accept="audio/*,video/*"
            style={{ display: 'none' }}
            ref={audioInputRef}
            onChange={handleAudioUpload}
          />
          <button
            onClick={() => {
               if (audioInputRef.current) {
                 audioInputRef.current.click();
               }
            }}
            style={{
              background: 'var(--color-surface-glass)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Music size={12} /> Add Áudio
          </button>
        </div>
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
        style={{ 
          background: 'var(--color-bg-elevated)', 
          border: '1px solid var(--color-surface-border)', 
          borderRadius: 8, 
          padding: '12px 12px 24px 12px',
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
      >
        <div ref={containerRef} style={{ width: `${timelineZoom}%`, position: 'relative' }}>
        {/* Timeline Axis Ruler */}
        <div 
          style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--color-text-ghost)', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: 4, cursor: 'pointer', userSelect: 'none', position: 'relative', height: 20 }}
          onPointerDown={handleTimelinePointerDown}
        >
          {Array.from({ length: Math.ceil(exportConfig.duration) + 1 }).map((_, i) => (
             <div key={i} style={{ position: 'absolute', left: `${(i / exportConfig.duration) * 100}%`, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
               <div style={{ width: 1, height: 4, background: 'var(--color-surface-border)' }} />
               <span style={{ marginTop: 2 }}>{i}s</span>
             </div>
          ))}
        </div>

        {/* Playhead Indicator */}
        <div style={{
          position: 'absolute',
          top: 12,
          bottom: 24,
          left: `calc(12px + ${(currentTime / exportConfig.duration) * 100}% - ${(currentTime / exportConfig.duration) * 24}px)`,
          width: 2,
          background: 'var(--color-accent, red)',
          zIndex: 50,
          pointerEvents: 'none',
        }}>
          {/* Playhead Handle */}
          <div style={{
            position: 'absolute',
            top: -6,
            left: -4,
            width: 10,
            height: 10,
            background: 'var(--color-accent, red)',
            borderRadius: '50%',
          }} />
        </div>

        {/* Master Background Track (If Video) */}
        {exportConfig.backgroundType === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 12 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Film size={10} /> Mestre: Background Vídeo
            </div>
            <div style={trackStyle}>
               <div 
                  className="timeline-track-block"
                  style={blockStyle(exportConfig.bgTrimStart || 0, (exportConfig.bgTrimEnd || exportConfig.duration) - (exportConfig.bgTrimStart || 0), 'rgba(255, 100, 50, 0.2)')}
                  onPointerDown={(e) => handlePointerDown(e, 'bg', 'move', true)}
               >
                 <div className={getHandleClass('bg', 'trim-left', 'left')} onPointerDown={(e) => handlePointerDown(e, 'bg', 'trim-left', true)}>
                    {dragging?.id === 'bg' && dragging?.type === 'trim-left' && (
                      <div style={tooltipStyle}>{(exportConfig.bgTrimStart || 0).toFixed(2)}s</div>
                    )}
                 </div>
                 <span style={{ margin: '0 auto', fontSize: '0.65rem', color: 'white', opacity: 0.8 }}>TRIM</span>
                 <div className={getHandleClass('bg', 'trim-right', 'right')} onPointerDown={(e) => handlePointerDown(e, 'bg', 'trim-right', true)}>
                    {dragging?.id === 'bg' && dragging?.type === 'trim-right' && (
                      <div style={tooltipStyle}>{(exportConfig.bgTrimEnd || exportConfig.duration).toFixed(2)}s</div>
                    )}
                 </div>
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
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={layer.transform.opacity} 
                      onChange={(e) => updateCompositionLayer(layer.id, { transform: { ...layer.transform, opacity: Number(e.target.value) } })} 
                      style={{ width: 40 }} title="Opacidade" 
                    />
                    <button 
                      onClick={() => updateCompositionLayer(layer.id, { locked: !layer.locked })} 
                      style={{ background: 'none', border: 'none', color: layer.locked ? 'var(--color-error)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title={layer.locked ? "Desbloquear camada" : "Bloquear camada"}
                    >
                      {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    <button 
                      onClick={() => index > 0 && reorderCompositionLayers(index, index - 1)} 
                      disabled={index === 0} 
                      style={{ background: 'none', border: 'none', color: index === 0 ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: index === 0 ? 'default' : 'pointer', padding: 2 }}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button 
                      onClick={() => index < compositionLayers.length - 1 && reorderCompositionLayers(index, index + 1)} 
                      disabled={index === compositionLayers.length - 1} 
                      style={{ background: 'none', border: 'none', color: index === compositionLayers.length - 1 ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: index === compositionLayers.length - 1 ? 'default' : 'pointer', padding: 2 }}
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button 
                      onClick={() => updateCompositionLayer(layer.id, { hidden: !layer.hidden })} 
                      style={{ background: 'none', border: 'none', color: layer.hidden ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title={layer.hidden ? "Mostrar camada" : "Ocultar camada"}
                    >
                      {layer.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={() => removeCompositionLayer(layer.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 2, marginLeft: 4 }}>
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                <div style={trackStyle}>
                   <div 
                      className="timeline-track-block"
                      style={blockStyle(layer.startTime, layer.duration, 'rgba(0, 150, 255, 0.2)')}
                      onPointerDown={(e) => handlePointerDown(e, layer.id, 'move')}
                   >
                     <div className={getHandleClass(layer.id, 'trim-left', 'left')} onPointerDown={(e) => handlePointerDown(e, layer.id, 'trim-left')}>
                        {dragging?.id === layer.id && dragging?.type === 'trim-left' && (
                          <div style={tooltipStyle}>{layer.startTime.toFixed(2)}s</div>
                        )}
                     </div>
                     <span style={{ margin: '0 auto', fontSize: '0.65rem', color: 'white', opacity: 0.8 }}>
                       {layer.startTime.toFixed(1)}s - {(layer.startTime + layer.duration).toFixed(1)}s
                     </span>
                     <div className={getHandleClass(layer.id, 'trim-right', 'right')} onPointerDown={(e) => handlePointerDown(e, layer.id, 'trim-right')}>
                        {dragging?.id === layer.id && dragging?.type === 'trim-right' && (
                          <div style={tooltipStyle}>{(layer.startTime + layer.duration).toFixed(2)}s</div>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Audio Tracks */}
        {audioTracks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, borderTop: '1px solid var(--color-surface-border)', paddingTop: 16 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Music size={10} /> Faixas de Áudio
            </div>
            {audioTracks.map((track) => (
              <div key={track.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
                  <span>Áudio: {track.name}</span>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={track.volume} 
                      onChange={(e) => updateAudioTrack(track.id, { volume: Number(e.target.value) })} 
                      style={{ width: 40 }} title="Volume" 
                    />
                    <button 
                      onClick={() => updateAudioTrack(track.id, { locked: !track.locked })} 
                      style={{ background: 'none', border: 'none', color: track.locked ? 'var(--color-error)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title={track.locked ? "Desbloquear faixa" : "Bloquear faixa"}
                    >
                      {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    <button onClick={() => updateAudioTrack(track.id, { muted: !track.muted })} style={{ background: 'none', border: 'none', color: track.muted ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2 }}>
                      {track.muted ? <VolumeX size={10} /> : <Volume2 size={10} />}
                    </button>
                    <button onClick={() => removeAudioTrack(track.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 2, marginLeft: 8 }}>
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                <div style={trackStyle}>
                   <div 
                      className="timeline-track-block"
                      style={{
                        ...blockStyle(track.startTime, track.duration, 'rgba(0, 255, 100, 0.2)'),
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 10 L2 14 M6 6 L6 16 M10 8 L10 12 M14 4 L14 18 M18 10 L18 14' stroke='rgba(0,255,100,0.4)' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat-x',
                        backgroundPosition: 'center'
                      }}
                      onPointerDown={(e) => handlePointerDown(e, track.id, 'move', false, true)}
                   >
                     <div className={getHandleClass(track.id, 'trim-left', 'left')} onPointerDown={(e) => handlePointerDown(e, track.id, 'trim-left', false, true)}>
                        {dragging?.id === track.id && dragging?.type === 'trim-left' && (
                          <div style={tooltipStyle}>{track.startTime.toFixed(2)}s</div>
                        )}
                     </div>
                     <span style={{ margin: '0 auto', fontSize: '0.65rem', color: 'white', opacity: 0.8 }}>
                       {track.startTime.toFixed(1)}s - {(track.startTime + track.duration).toFixed(1)}s
                     </span>
                     <div className={getHandleClass(track.id, 'trim-right', 'right')} onPointerDown={(e) => handlePointerDown(e, track.id, 'trim-right', false, true)}>
                        {dragging?.id === track.id && dragging?.type === 'trim-right' && (
                          <div style={tooltipStyle}>{(track.startTime + track.duration).toFixed(2)}s</div>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
