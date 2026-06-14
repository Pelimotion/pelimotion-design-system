import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, Plus, Trash2, Film, ChevronUp, ChevronDown, ChevronRight, Play, Pause, SkipBack, Music, Volume2, VolumeX, Eye, EyeOff, Lock, Unlock, Magnet, Copy, Scissors, Circle } from 'lucide-react';
import { formatTimecode } from '@/utils/timecode';
import { useEditorStore } from '@/store/useEditorStore';
import { gsap } from 'gsap';
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
    togglePlayback,
    activeCompositionLayerId,
    setActiveCompositionLayerId,
    activeAudioTrackId,
    setActiveAudioTrackId
  } = useEditorStore();

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isCompExpanded, setIsCompExpanded] = useState(true);
  const [isAudioExpanded, setIsAudioExpanded] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapTolerance, setSnapTolerance] = useState<number>(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [timelineZoom, setTimelineZoom] = useState(100);
  const playheadRef = useRef<HTMLDivElement>(null);
  
  // Playhead Realtime Sync
  useEffect(() => {
    if (!isPlaying) return;
    const ticker = () => {
      const time = gsap.globalTimeline.time();
      if (playheadRef.current) {
        const pct = (time / exportConfig.duration) * 100;
        const px = (time / exportConfig.duration) * 24;
        playheadRef.current.style.left = `calc(12px + ${pct}% - ${px}px)`;
      }
    };
    gsap.ticker.add(ticker);
    return () => gsap.ticker.remove(ticker);
  }, [isPlaying, exportConfig.duration]);
  
  // Interaction State
  const [dragging, setDragging] = useState<{ id: string, type: 'move' | 'trim-left' | 'trim-right' | 'playhead', isBg?: boolean, isAudio?: boolean } | null>(null);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(10); // default
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, layerId: string, isAudio?: boolean } | null>(null);

  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

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

  const toggleTrackColor = (id: string, type: 'audio' | 'comp', currentColor?: string) => {
    const COLORS = ['#ff4b4b', '#fca130', '#f9ed32', '#21ce99', '#14a9ff', '#b146c2', 'transparent'];
    const idx = currentColor ? COLORS.indexOf(currentColor) : -1;
    const nextColor = COLORS[(idx + 1) % COLORS.length];
    if (type === 'audio') {
      updateAudioTrack(id, { colorTag: nextColor === 'transparent' ? undefined : nextColor });
    } else {
      updateCompositionLayer(id, { colorTag: nextColor === 'transparent' ? undefined : nextColor });
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

  const applyTimeUpdate = useCallback((time: number) => {
    if (!dragging) return;

    if (dragging.type === 'playhead') {
      seek(time);
      import('gsap').then(({ gsap }) => {
        gsap.globalTimeline.pause();
        gsap.globalTimeline.seek(time);
      });
      return;
    }

    if (dragging.isBg) {
       const trimStart = exportConfig.bgTrimStart || 0;
       const trimEnd = exportConfig.bgTrimEnd || exportConfig.duration;
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
  }, [dragging, exportConfig, compositionLayers, audioTracks, updateExportConfig, updateCompositionLayer, updateAudioTrack, seek]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Offset by the padding (12px) where the timeline starts
    const mouseX = e.clientX - (rect.left + 12);
    // Add extra width protection to avoid going outside
    const trackWidth = rect.width - 24; 
    let time = Math.max(0, Math.min(exportConfig.duration, (mouseX / trackWidth) * exportConfig.duration));

    if (snapEnabled && dragging.type !== 'playhead') {
      const inv = 1 / snapTolerance;
      let gridTime = Math.round(time * inv) / inv;

      // Magnetic Edge Snapping
      const snapPoints: number[] = [];
      compositionLayers.forEach(l => {
         if (l.id !== dragging.id) {
           snapPoints.push(l.startTime, l.startTime + l.duration);
         }
      });
      audioTracks.forEach(t => {
         if (t.id !== dragging.id) {
           snapPoints.push(t.startTime, t.startTime + t.duration);
         }
      });
      // Include 0 and duration edges
      snapPoints.push(0, exportConfig.duration);
      
      let closestEdge = -1;
      let minDiff = 0.2; // 0.2s magnetic threshold
      for (const pt of snapPoints) {
         const diff = Math.abs(time - pt);
         if (diff < minDiff) {
            minDiff = diff;
            closestEdge = pt;
         }
      }

      if (closestEdge !== -1) {
         time = closestEdge;
      } else {
         time = gridTime;
      }
    }

    applyTimeUpdate(time);
  }, [dragging, exportConfig.duration, snapEnabled, snapTolerance, compositionLayers, audioTracks, applyTimeUpdate]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    let scrollAnimationFrame: number;
    let currentMouseX = 0;

    const handleWindowPointerMove = (e: PointerEvent) => {
      currentMouseX = e.clientX;
      handlePointerMove(e);
    };

    const autoScrollLoop = () => {
      const scrollContainer = document.getElementById('timeline-scroll-container');
      if (scrollContainer && dragging) {
        const rect = scrollContainer.getBoundingClientRect();
        const edgeThreshold = 40; // 40px from edge
        const scrollSpeed = 10;

        if (currentMouseX > rect.right - edgeThreshold) {
          scrollContainer.scrollLeft += scrollSpeed;
          // Re-trigger calculation with updated scroll
          if (containerRef.current) {
            const trackRect = containerRef.current.getBoundingClientRect();
            const virtualMouseX = currentMouseX - (trackRect.left + 12);
            const trackWidth = trackRect.width - 24; 
            const time = Math.max(0, Math.min(exportConfig.duration, (virtualMouseX / trackWidth) * exportConfig.duration));
            
            // Re-apply snapping logic for virtual move
            let finalTime = time;
            if (snapEnabled && dragging.type !== 'playhead') {
               const inv = 1 / snapTolerance;
               let gridTime = Math.round(time * inv) / inv;
               const snapPoints: number[] = [];
               compositionLayers.forEach(l => { if (l.id !== dragging.id) { snapPoints.push(l.startTime, l.startTime + l.duration); } });
               audioTracks.forEach(t => { if (t.id !== dragging.id) { snapPoints.push(t.startTime, t.startTime + t.duration); } });
               snapPoints.push(0, exportConfig.duration);
               let closestEdge = -1;
               let minDiff = 0.2;
               for (const pt of snapPoints) {
                  const diff = Math.abs(time - pt);
                  if (diff < minDiff) { minDiff = diff; closestEdge = pt; }
               }
               finalTime = closestEdge !== -1 ? closestEdge : gridTime;
            }
            applyTimeUpdate(finalTime);
          }
        } else if (currentMouseX < rect.left + edgeThreshold) {
          scrollContainer.scrollLeft -= scrollSpeed;
          if (containerRef.current) {
            const trackRect = containerRef.current.getBoundingClientRect();
            const virtualMouseX = currentMouseX - (trackRect.left + 12);
            const trackWidth = trackRect.width - 24; 
            const time = Math.max(0, Math.min(exportConfig.duration, (virtualMouseX / trackWidth) * exportConfig.duration));
            
            let finalTime = time;
            if (snapEnabled && dragging.type !== 'playhead') {
               const inv = 1 / snapTolerance;
               let gridTime = Math.round(time * inv) / inv;
               const snapPoints: number[] = [];
               compositionLayers.forEach(l => { if (l.id !== dragging.id) { snapPoints.push(l.startTime, l.startTime + l.duration); } });
               audioTracks.forEach(t => { if (t.id !== dragging.id) { snapPoints.push(t.startTime, t.startTime + t.duration); } });
               snapPoints.push(0, exportConfig.duration);
               let closestEdge = -1;
               let minDiff = 0.2;
               for (const pt of snapPoints) {
                  const diff = Math.abs(time - pt);
                  if (diff < minDiff) { minDiff = diff; closestEdge = pt; }
               }
               finalTime = closestEdge !== -1 ? closestEdge : gridTime;
            }
            applyTimeUpdate(finalTime);
          }
        }
      }
      scrollAnimationFrame = requestAnimationFrame(autoScrollLoop);
    };

    if (dragging) {
      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      scrollAnimationFrame = requestAnimationFrame(autoScrollLoop);
    } else {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(scrollAnimationFrame);
    };
  }, [dragging, handlePointerMove, handlePointerUp, exportConfig.duration]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} color="var(--color-accent)" /> Linha do Tempo
          </h3>
          <div style={{ 
            fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, 
            color: 'var(--color-accent)', background: 'rgba(0,0,0,0.3)', 
            padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-surface-border)'
          }}>
            {formatTimecode(currentTime, exportConfig.fps)}
          </div>
        </div>
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
          
          <button
            onClick={() => {
              let nextSpeed = 1;
              if (playbackSpeed === 1) nextSpeed = 2;
              else if (playbackSpeed === 2) nextSpeed = 0.5;
              else nextSpeed = 1;
              setPlaybackSpeed(nextSpeed);
              gsap.globalTimeline.timeScale(nextSpeed);
              document.querySelectorAll('audio').forEach(audio => { audio.playbackRate = nextSpeed; });
            }}
            style={{
              background: 'var(--color-surface-glass)',
              color: playbackSpeed !== 1 ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '0.65rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Velocidade de Reprodução"
          >
            {playbackSpeed}x
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--color-surface-glass)', borderRadius: 4, border: '1px solid var(--color-surface-border)', overflow: 'hidden' }}>
            <button
              onClick={() => setSnapEnabled(!snapEnabled)}
              style={{
                background: snapEnabled ? 'var(--color-accent)' : 'transparent',
                color: snapEnabled ? '#fff' : 'var(--color-text-secondary)',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Snap to Grid"
            >
              <Magnet size={12} />
            </button>
            {snapEnabled && (
              <select
                value={snapTolerance}
                onChange={(e) => setSnapTolerance(Number(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderLeft: '1px solid var(--color-surface-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.65rem',
                  padding: '2px 4px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                title="Tolerância Magnética"
              >
                <option value={0.1} style={{ color: 'black' }}>0.1s</option>
                <option value={0.25} style={{ color: 'black' }}>0.25s</option>
                <option value={0.5} style={{ color: 'black' }}>0.5s</option>
                <option value={1.0} style={{ color: 'black' }}>1.0s</option>
              </select>
            )}
          </div>

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
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Res:</span>
            <select
              value={exportConfig.resolution}
              onChange={(e) => updateExportConfig({ resolution: e.target.value as any })}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', fontSize: '0.7rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="1920x1080" style={{ color: 'black' }}>16:9 (1080p)</option>
              <option value="1080x1920" style={{ color: 'black' }}>9:16 (Vertical)</option>
              <option value="1080x1080" style={{ color: 'black' }}>1:1 (Square)</option>
            </select>
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-glass)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-surface-border)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Fundo:</span>
            <input
              type="color"
              value={exportConfig.backgroundColor === 'rgba(0,0,0,0)' ? '#000000' : exportConfig.backgroundColor}
              onChange={(e) => updateExportConfig({ backgroundColor: e.target.value })}
              style={{ width: 20, height: 20, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              title="Cor de Fundo"
            />
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--color-surface-border)', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-surface-glass)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-surface-border)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>FPS:</span>
            <select
              value={exportConfig.fps}
              onChange={(e) => updateExportConfig({ fps: Number(e.target.value) })}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', fontSize: '0.7rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value={24} style={{ color: 'black' }}>24</option>
              <option value={30} style={{ color: 'black' }}>30</option>
              <option value={60} style={{ color: 'black' }}>60</option>
            </select>
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
        id="timeline-scroll-container"
        style={{ 
          background: 'var(--color-bg-elevated)', 
          border: '1px solid var(--color-surface-border)', 
          borderRadius: 8, 
          padding: '12px 12px 24px 12px',
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
        onWheel={(e) => {
          if (e.altKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -20 : 20;
            setTimelineZoom(prev => Math.max(100, Math.min(500, prev + delta)));
          }
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
        <div 
          ref={playheadRef}
          style={{
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
            <div 
              style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setIsCompExpanded(!isCompExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isCompExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Camadas Visuais ({compositionLayers.length})
              </div>
              <div style={{ display: 'flex', gap: 8, marginRight: 8 }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const allLocked = compositionLayers.length > 0 && compositionLayers.every(l => l.locked);
                    useEditorStore.setState(state => ({ compositionLayers: state.compositionLayers.map(l => ({ ...l, locked: !allLocked })) }));
                  }} 
                  style={{ background: 'none', border: 'none', color: (compositionLayers.length > 0 && compositionLayers.every(l => l.locked)) ? 'var(--color-error)' : 'var(--color-text-ghost)', cursor: 'pointer', padding: 2 }}
                  title="Bloquear/Desbloquear Todas"
                >
                  <Lock size={12} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const allHidden = compositionLayers.length > 0 && compositionLayers.every(l => l.hidden);
                    useEditorStore.setState(state => ({ compositionLayers: state.compositionLayers.map(l => ({ ...l, hidden: !allHidden })) }));
                  }} 
                  style={{ background: 'none', border: 'none', color: (compositionLayers.length > 0 && compositionLayers.every(l => l.hidden)) ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2 }}
                  title="Mostrar/Ocultar Todas"
                >
                  <Eye size={12} />
                </button>
              </div>
            </div>
            {isCompExpanded && compositionLayers.map((layer, index) => (
              <div 
                key={layer.id} 
                onClick={() => { setActiveCompositionLayerId(layer.id); setActiveAudioTrackId(null); }}
                style={{ 
                  display: 'flex', flexDirection: 'column', gap: 2,
                  background: activeCompositionLayerId === layer.id ? 'var(--color-surface-glass)' : 'transparent',
                  padding: '4px 6px', borderRadius: 4, margin: '0 -6px',
                  border: activeCompositionLayerId === layer.id ? '1px solid var(--color-surface-border)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{index + 1}:</span>
                    <input
                      value={layer.name}
                      onChange={(e) => updateCompositionLayer(layer.id, { name: e.target.value })}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed transparent', color: 'var(--color-text-primary)', fontSize: '0.65rem', outline: 'none', cursor: 'text', width: 120 }}
                      onFocus={(e) => { e.currentTarget.style.borderBottom = '1px dashed var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderBottom = '1px dashed transparent'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                    />
                    <button 
                      onClick={() => toggleTrackColor(layer.id, 'comp', layer.colorTag)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                      title="Mudar Cor da Camada"
                    >
                      <Circle size={10} fill={layer.colorTag || 'transparent'} color={layer.colorTag || 'var(--color-text-ghost)'} />
                    </button>
                  </div>
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
                    <button 
                      onClick={() => {
                        if (currentTime > layer.startTime && currentTime < layer.startTime + layer.duration) {
                          const splitTime = currentTime;
                          const newDuration1 = splitTime - layer.startTime;
                          const newDuration2 = (layer.startTime + layer.duration) - splitTime;
                          updateCompositionLayer(layer.id, { duration: newDuration1 });
                          const duplicate = { ...layer, id: crypto.randomUUID(), startTime: splitTime, duration: newDuration2 };
                          addCompositionLayer(duplicate);
                        }
                      }} 
                      style={{ background: 'none', border: 'none', color: (currentTime > layer.startTime && currentTime < layer.startTime + layer.duration) ? 'var(--color-text-primary)' : 'var(--color-surface-border)', cursor: (currentTime > layer.startTime && currentTime < layer.startTime + layer.duration) ? 'pointer' : 'default', padding: 2, marginLeft: 4 }}
                      title="Cortar na Agulha (Split)"
                    >
                      <Scissors size={10} />
                    </button>
                    <button 
                      onClick={() => {
                        const duplicate = { ...layer, id: crypto.randomUUID(), startTime: Math.min(layer.startTime + 0.5, exportConfig.duration) };
                        addCompositionLayer(duplicate);
                      }} 
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title="Duplicar"
                    >
                      <Copy size={10} />
                    </button>
                    <button onClick={() => removeCompositionLayer(layer.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 2, marginLeft: 4 }}>
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                <div style={trackStyle}>
                   <div 
                      className="timeline-track-block"
                      style={blockStyle(layer.startTime, layer.duration, layer.colorTag ? layer.colorTag + '33' : 'rgba(0, 150, 255, 0.2)')}
                      onPointerDown={(e) => !layer.locked && handlePointerDown(e, layer.id, 'move')}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setActiveCompositionLayerId(layer.id);
                        setContextMenu({ x: e.clientX, y: e.clientY, layerId: layer.id, isAudio: false });
                      }}
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
            <div 
              style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setIsAudioExpanded(!isAudioExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isAudioExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Faixas de Áudio ({audioTracks.length})
              </div>
              <div style={{ display: 'flex', gap: 8, marginRight: 8 }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const allLocked = audioTracks.length > 0 && audioTracks.every(t => t.locked);
                    useEditorStore.setState(state => ({ audioTracks: state.audioTracks.map(t => ({ ...t, locked: !allLocked })) }));
                  }} 
                  style={{ background: 'none', border: 'none', color: (audioTracks.length > 0 && audioTracks.every(t => t.locked)) ? 'var(--color-error)' : 'var(--color-text-ghost)', cursor: 'pointer', padding: 2 }}
                  title="Bloquear/Desbloquear Todas"
                >
                  <Lock size={12} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const allMuted = audioTracks.length > 0 && audioTracks.every(t => t.muted);
                    useEditorStore.setState(state => ({ audioTracks: state.audioTracks.map(t => ({ ...t, muted: !allMuted })) }));
                  }} 
                  style={{ background: 'none', border: 'none', color: (audioTracks.length > 0 && audioTracks.every(t => t.muted)) ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2 }}
                  title="Mutar/Desmutar Todas"
                >
                  <VolumeX size={12} />
                </button>
              </div>
            </div>
            {isAudioExpanded && audioTracks.map((track) => (
              <div 
                key={track.id} 
                onClick={() => { setActiveAudioTrackId(track.id); setActiveCompositionLayerId(null); }}
                style={{ 
                  display: 'flex', flexDirection: 'column', gap: 2,
                  background: activeAudioTrackId === track.id ? 'var(--color-surface-glass)' : 'transparent',
                  padding: '4px 6px', borderRadius: 4, margin: '0 -6px',
                  border: activeAudioTrackId === track.id ? '1px solid var(--color-surface-border)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      value={track.name}
                      onChange={(e) => updateAudioTrack(track.id, { name: e.target.value })}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed transparent', color: 'var(--color-text-primary)', fontSize: '0.65rem', outline: 'none', cursor: 'text', width: 120 }}
                      onFocus={(e) => { e.currentTarget.style.borderBottom = '1px dashed var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderBottom = '1px dashed transparent'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                    />
                    <button 
                      onClick={() => toggleTrackColor(track.id, 'audio', track.colorTag)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                      title="Mudar Cor da Faixa"
                    >
                      <Circle size={10} fill={track.colorTag || 'transparent'} color={track.colorTag || 'var(--color-text-ghost)'} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-base)', padding: '2px 4px', borderRadius: 4, gap: 4, marginRight: 4 }}>
                      <span style={{ fontSize: '0.55rem', opacity: 0.8 }}>In</span>
                      <input 
                        type="number" min="0" max="5" step="0.1" 
                        value={track.fadeIn || 0} 
                        onChange={(e) => updateAudioTrack(track.id, { fadeIn: Number(e.target.value) })} 
                        style={{ width: 35, fontSize: '0.6rem', textAlign: 'center', background: 'transparent', border: 'none', color: 'white', outline: 'none' }} title="Fade In (s)" 
                      />
                      <span style={{ fontSize: '0.55rem', opacity: 0.8, marginLeft: 2 }}>Out</span>
                      <input 
                        type="number" min="0" max="5" step="0.1" 
                        value={track.fadeOut || 0} 
                        onChange={(e) => updateAudioTrack(track.id, { fadeOut: Number(e.target.value) })} 
                        style={{ width: 35, fontSize: '0.6rem', textAlign: 'center', background: 'transparent', border: 'none', color: 'white', outline: 'none' }} title="Fade Out (s)" 
                      />
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={track.volume} 
                      onChange={(e) => updateAudioTrack(track.id, { volume: Number(e.target.value) })} 
                      style={{ width: 40 }} title="Volume" 
                    />
                    <button 
                      onClick={() => updateAudioTrack(track.id, { locked: !track.locked })} 
                      style={{ background: 'none', border: 'none', color: track.locked ? 'var(--color-error)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title={track.locked ? "Desbloquear" : "Bloquear"}
                    >
                      {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    <button 
                      onClick={() => updateAudioTrack(track.id, { muted: !track.muted })} 
                      style={{ background: 'none', border: 'none', color: track.muted ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title={track.muted ? "Desmutar" : "Mutar"}
                    >
                      {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <button 
                      onClick={() => updateAudioTrack(track.id, { solo: !track.solo })} 
                      style={{ 
                        background: track.solo ? 'var(--color-warning)' : 'transparent', 
                        border: '1px solid ' + (track.solo ? 'var(--color-warning)' : 'var(--color-text-ghost)'), 
                        borderRadius: 3,
                        color: track.solo ? '#000' : 'var(--color-text-ghost)', 
                        cursor: 'pointer', padding: '0 4px', fontSize: '0.55rem', fontWeight: 800, marginLeft: 4 
                      }}
                      title={track.solo ? "Remover Solo" : "Solo"}
                    >
                      S
                    </button>
                    <button 
                      onClick={() => {
                        if (currentTime > track.startTime && currentTime < track.startTime + track.duration) {
                          const splitTime = currentTime;
                          const newDuration1 = splitTime - track.startTime;
                          const newDuration2 = (track.startTime + track.duration) - splitTime;
                          updateAudioTrack(track.id, { duration: newDuration1 });
                          const duplicate = { ...track, id: crypto.randomUUID(), startTime: splitTime, duration: newDuration2 };
                          addAudioTrack(duplicate);
                        }
                      }} 
                      style={{ background: 'none', border: 'none', color: (currentTime > track.startTime && currentTime < track.startTime + track.duration) ? 'var(--color-text-primary)' : 'var(--color-surface-border)', cursor: (currentTime > track.startTime && currentTime < track.startTime + track.duration) ? 'pointer' : 'default', padding: 2, marginLeft: 4 }}
                      title="Cortar na Agulha (Split)"
                    >
                      <Scissors size={10} />
                    </button>
                    <button 
                      onClick={() => {
                        const duplicate = { ...track, id: crypto.randomUUID(), startTime: Math.min(track.startTime + 0.5, exportConfig.duration) };
                        addAudioTrack(duplicate);
                      }} 
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title="Duplicar"
                    >
                      <Copy size={10} />
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

      {/* Context Menu */}
      {contextMenu && (
        <div 
          style={{ 
            position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 9999,
            background: 'var(--color-bg-elevated)', border: '1px solid var(--color-surface-border)',
            borderRadius: 8, padding: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: 2, minWidth: 150
          }}
          onContextMenu={e => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => {
             const state = useEditorStore.getState();
             const layer = contextMenu.isAudio ? state.audioTracks.find(t => t.id === contextMenu.layerId) : state.compositionLayers.find(l => l.id === contextMenu.layerId);
             if (layer) state.setClipboard({ type: contextMenu.isAudio ? 'audio' : 'composition', data: layer });
             setContextMenu(null);
          }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 4, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <Copy size={12} /> Copiar (Cmd+C)
          </button>
          
          <button onClick={() => {
             const state = useEditorStore.getState();
             const layer = contextMenu.isAudio ? state.audioTracks.find(t => t.id === contextMenu.layerId) : state.compositionLayers.find(l => l.id === contextMenu.layerId);
             if (layer) {
               const duplicate = { ...layer, id: crypto.randomUUID(), startTime: Math.min(layer.startTime + 0.5, exportConfig.duration) };
               if (contextMenu.isAudio) state.addAudioTrack(duplicate as any);
               else state.addCompositionLayer(duplicate as any);
             }
             setContextMenu(null);
          }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 4, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <Copy size={12} /> Duplicar (Cmd+D)
          </button>

          <button onClick={() => {
             const state = useEditorStore.getState();
             const layer = contextMenu.isAudio ? state.audioTracks.find(t => t.id === contextMenu.layerId) : state.compositionLayers.find(l => l.id === contextMenu.layerId);
             if (layer && currentTime > layer.startTime && currentTime < layer.startTime + layer.duration) {
               const newDuration1 = currentTime - layer.startTime;
               const newDuration2 = (layer.startTime + layer.duration) - currentTime;
               if (contextMenu.isAudio) {
                 state.updateAudioTrack(layer.id, { duration: newDuration1 });
                 state.addAudioTrack({ ...layer, id: crypto.randomUUID(), startTime: currentTime, duration: newDuration2 } as any);
               } else {
                 state.updateCompositionLayer(layer.id, { duration: newDuration1 });
                 state.addCompositionLayer({ ...layer, id: crypto.randomUUID(), startTime: currentTime, duration: newDuration2 } as any);
               }
             }
             setContextMenu(null);
          }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 4, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <Scissors size={12} /> Fatiar (Cmd+Shift+D)
          </button>

          <div style={{ height: 1, background: 'var(--color-surface-border)', margin: '4px 0' }} />

          <button onClick={() => {
             const state = useEditorStore.getState();
             if (contextMenu.isAudio) state.removeAudioTrack(contextMenu.layerId);
             else state.removeCompositionLayer(contextMenu.layerId);
             setContextMenu(null);
          }} style={{ background: 'none', border: 'none', color: 'var(--color-error)', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 4, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,0,0,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <Trash2 size={12} /> Deletar (Del)
          </button>
        </div>
      )}
    </div>
  );
}
