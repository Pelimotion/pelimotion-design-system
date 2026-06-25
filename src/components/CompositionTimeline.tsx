// timeline-needle-sync
// timeline-simplified
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, Plus, Trash2, Film, ChevronDown, ChevronRight, Play, Pause, SkipBack, Music, Volume2, VolumeX, Eye, EyeOff, Lock, Unlock, Magnet, Copy, Scissors, Circle, Settings } from 'lucide-react';
import { formatTimecode, parseTimecode } from '@/utils/timecode';
import { useEditorStore } from '@/store/useEditorStore';
import { gsap } from 'gsap';
import type { AudioTrack } from '@/types/motion.types';

export function CompositionTimeline() {
  const { 
    layers, // v3.0 Universal Layers
    audioTracks,
    updateLayer,
    addAudioTrack,
    removeAudioTrack,
    updateAudioTrack,
    localLibraryItems,
    exportConfig,
    updateExportConfig,
    currentTime,
    seek,
    isPlaying,
    togglePlayback,
    selectedLayerId,
    setSelectedLayerId,
    activeAudioTrackId,
    setActiveAudioTrackId,
    setScrubbing
  } = useEditorStore();

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isCompExpanded, setIsCompExpanded] = useState(true);
  const [isAudioExpanded, setIsAudioExpanded] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapTolerance, setSnapTolerance] = useState<number>(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [timelineZoom, setTimelineZoom] = useState(100);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [isEditingTimecode, setIsEditingTimecode] = useState(false);
  const [tempTimecode, setTempTimecode] = useState('');

  useEffect(() => {
    if (!isEditingTimecode) {
      setTempTimecode(formatTimecode(currentTime, exportConfig.fps));
    }
  }, [currentTime, exportConfig.fps, isEditingTimecode]);
  
  // Playhead Realtime Sync — always active, reads state directly to avoid stale closures
  useEffect(() => {
    const ticker = () => {
      const time = useEditorStore.getState().currentTime;
      const duration = useEditorStore.getState().exportConfig.duration;
      if (playheadRef.current && duration > 0) {
        const pct = (time / duration) * 100;
        const px = (time / duration) * 24;
        playheadRef.current.style.left = `calc(12px + ${pct}% - ${px}px)`;
      }
    };
    gsap.ticker.add(ticker);
    return () => gsap.ticker.remove(ticker);
  }, []); // no deps — runs forever, reads from store directly
  
  // Interaction State
  const [dragging, setDragging] = useState<{ id: string, type: 'move' | 'trim-left' | 'trim-right' | 'playhead', isBg?: boolean, isAudio?: boolean } | null>(null);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, layerId: string, isAudio?: boolean } | null>(null);

  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);


  const handleAddLocalItem = (_item: any) => {
    // This function creates a CompositionLayer, but we now use UniversalLayers for main elements.
    // Temporarily disabled to avoid compilation error because addCompositionLayer is removed.
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
      // updateLayer(id, { colorTag: nextColor === 'transparent' ? undefined : nextColor });
      // UniversalLayers don't have colorTag currently. Do nothing for now to prevent error.
    }
  };

  // --- Pointer Event Handlers ---
  const handlePointerDown = (e: React.PointerEvent, id: string, type: 'move' | 'trim-left' | 'trim-right', isBg?: boolean, isAudio?: boolean) => {
    if (isAudio) {
      const track = audioTracks.find(t => t.id === id);
      if (track?.locked) return;
    } else if (!isBg) {
      const layer = layers.find(l => l.id === id);
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
    } else if (dragging.type === 'move' || dragging.type === 'trim-left' || dragging.type === 'trim-right') {
       // Visual layers (UniversalLayer) don't support trimming yet.
    }
  }, [dragging, exportConfig, layers, audioTracks, updateExportConfig, updateLayer, updateAudioTrack, seek]);

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
      const gridTime = Math.round(time * inv) / inv;

      // Magnetic Edge Snapping
      const snapPoints: number[] = [];
      layers.forEach(l => {
         if (l.id !== dragging.id) {
           snapPoints.push(0, exportConfig.duration);
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
  }, [dragging, exportConfig.duration, snapEnabled, snapTolerance, layers, audioTracks, applyTimeUpdate]);

  const handlePointerUp = useCallback(() => {
    setDragging(null);
    setScrubbing(false);
  }, [setScrubbing]);

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
               const gridTime = Math.round(time * inv) / inv;
               const snapPoints: number[] = [];
               layers.forEach(l => { if (l.id !== dragging.id) { snapPoints.push(0, exportConfig.duration); } });
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
               const gridTime = Math.round(time * inv) / inv;
               const snapPoints: number[] = [];
               layers.forEach(l => { if (l.id !== dragging.id) { snapPoints.push(0, exportConfig.duration); } });
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
  }, [dragging, handlePointerMove, handlePointerUp, exportConfig.duration, setScrubbing, applyTimeUpdate, audioTracks, layers, snapEnabled, snapTolerance]);

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
    setScrubbing(true);
    setDragging({ id: 'playhead', type: 'playhead' });
  };

  // Track rendering styles
  const trackStyle: React.CSSProperties = {
    height: 24,
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-surface-border)',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
    marginTop: 4
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
    <div id="composition-timeline" data-testid="timeline" style={{ display: 'flex', flexDirection: 'column', gap: 12, userSelect: 'none' /* user-select: none */ }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} color="var(--color-accent)" /> Linha do Tempo
          </h3>
          {isEditingTimecode ? (
            <input
              type="text"
              value={tempTimecode}
              onChange={(e) => setTempTimecode(e.target.value)}
              onBlur={() => {
                setIsEditingTimecode(false);
                const time = parseTimecode(tempTimecode, exportConfig.fps);
                if (!isNaN(time)) {
                  const bounded = Math.max(0, Math.min(exportConfig.duration, time));
                  seek(bounded);
                  import('gsap').then(({ gsap }) => {
                    gsap.globalTimeline.pause();
                    gsap.globalTimeline.seek(bounded);
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                } else if (e.key === 'Escape') {
                  setIsEditingTimecode(false);
                }
              }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, 
                color: 'var(--color-accent)', background: 'rgba(0,0,0,0.6)', 
                padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-accent)',
                outline: 'none', width: 110, textAlign: 'center'
              }}
              autoFocus
            />
          ) : (
            <div 
              onClick={() => {
                if (isPlaying) togglePlayback();
                setIsEditingTimecode(true);
                setTempTimecode(formatTimecode(currentTime, exportConfig.fps));
              }}
              style={{ 
                fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, 
                color: 'var(--color-accent)', background: 'rgba(0,0,0,0.3)', 
                padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-surface-border)',
                cursor: 'pointer'
              }}
              title="Clique para editar o timecode"
            >
              {formatTimecode(currentTime, exportConfig.fps)}
            </div>
          )}
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

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              style={{
                background: showSettingsMenu ? 'var(--color-accent)' : 'var(--color-surface-glass)',
                color: showSettingsMenu ? '#fff' : 'var(--color-text-primary)',
                border: '1px solid var(--color-surface-border)',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Configurações de Composição"
            >
              <Settings size={12} style={{ color: showSettingsMenu ? '#0a0a0f' : 'inherit' }} /> Configurações
            </button>

            {showSettingsMenu && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: 8,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-surface-border)',
                borderRadius: 6,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                width: 220,
                zIndex: 999,
                boxShadow: 'var(--shadow-glow)'
              }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>Configurações de Composição</h4>
                
                {/* Resolução */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Resolução:</label>
                  <select
                    value={exportConfig.resolution}
                    onChange={(e) => updateExportConfig({ resolution: e.target.value as any })}
                    style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-surface-border)', borderRadius: 4, color: 'var(--color-text-primary)', fontSize: '0.7rem', padding: '4px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="1920x1080" style={{ color: 'white', background: 'var(--color-bg-elevated)' }}>16:9 (1080p)</option>
                    <option value="1080x1920" style={{ color: 'white', background: 'var(--color-bg-elevated)' }}>9:16 (Vertical)</option>
                    <option value="1080x1080" style={{ color: 'white', background: 'var(--color-bg-elevated)' }}>1:1 (Square)</option>
                  </select>
                </div>

                {/* FPS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>FPS:</label>
                  <select
                    value={exportConfig.fps}
                    onChange={(e) => updateExportConfig({ fps: Number(e.target.value) })}
                    style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-surface-border)', borderRadius: 4, color: 'var(--color-text-primary)', fontSize: '0.7rem', padding: '4px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value={24} style={{ color: 'white', background: 'var(--color-bg-elevated)' }}>24 FPS</option>
                    <option value={30} style={{ color: 'white', background: 'var(--color-bg-elevated)' }}>30 FPS</option>
                    <option value={60} style={{ color: 'white', background: 'var(--color-bg-elevated)' }}>60 FPS</option>
                  </select>
                </div>

                {/* Fundo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Cor de Fundo:</label>
                  <input
                    type="color"
                    value={exportConfig.backgroundColor === 'rgba(0,0,0,0)' ? '#000000' : exportConfig.backgroundColor}
                    onChange={(e) => updateExportConfig({ backgroundColor: e.target.value })}
                    style={{ width: 30, height: 20, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                  />
                </div>

                {/* Duração */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Duração (s):</label>
                  <input
                    type="number"
                    min="1" max="120"
                    value={exportConfig.duration}
                    onChange={(e) => updateExportConfig({ duration: Number(e.target.value) || 5 })}
                    style={{
                      background: 'var(--color-bg-primary)', border: '1px solid var(--color-surface-border)', borderRadius: 4, color: 'var(--color-text-primary)', fontSize: '0.7rem', padding: '4px', outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}
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
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setScrubbing(true);
            setDragging({ id: 'playhead', type: 'playhead' });
          }}
          style={{
            position: 'absolute',
            top: 12,
            bottom: 24,
            left: `calc(12px + ${(currentTime / exportConfig.duration) * 100}% - ${(currentTime / exportConfig.duration) * 24}px)`,
            width: 12, // Wider clickable container
            marginLeft: -5,
            background: 'transparent',
            zIndex: 50,
            cursor: 'col-resize',
            pointerEvents: 'auto',
          }}
        >
          {/* Red line */}
          <div style={{
            position: 'absolute',
            left: 5,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--color-accent, red)',
          }} />
          {/* Playhead Handle */}
          <div style={{
            position: 'absolute',
            top: -6,
            left: 1,
            width: 10,
            height: 10,
            background: 'var(--color-accent, red)',
            borderRadius: '50%',
            boxShadow: '0 0 4px rgba(255,0,0,0.5)',
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
        {layers.length === 0 && exportConfig.backgroundType !== 'video' ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.75rem', color: 'var(--color-text-ghost)' }}>
            Nenhum elemento na Timeline.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <div 
              style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setIsCompExpanded(!isCompExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isCompExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Elementos Visuais ({layers.length})
              </div>
              <div style={{ display: 'flex', gap: 8, marginRight: 8 }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const allLocked = layers.length > 0 && layers.every(l => l.locked);
                    useEditorStore.setState(state => ({ layers: state.layers.map(l => ({ ...l, locked: !allLocked })) }));
                  }} 
                  style={{ background: 'none', border: 'none', color: (layers.length > 0 && layers.every(l => l.locked)) ? 'var(--color-error)' : 'var(--color-text-ghost)', cursor: 'pointer', padding: 2 }}
                  title="Bloquear/Desbloquear Todas"
                >
                  <Lock size={12} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const allHidden = layers.length > 0 && layers.every(l => !l.visible);
                    useEditorStore.setState(state => ({ layers: state.layers.map(l => ({ ...l, visible: allHidden })) }));
                  }} 
                  style={{ background: 'none', border: 'none', color: (layers.length > 0 && layers.every(l => !l.visible)) ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2 }}
                  title="Mostrar/Ocultar Todas"
                >
                  <Eye size={12} />
                </button>
              </div>
            </div>
            {isCompExpanded && [...layers].reverse().map((layer, index) => (
              <div 
                key={layer.id} 
                onClick={() => { setSelectedLayerId(layer.id); setActiveAudioTrackId(null); }}
                style={{ 
                  display: 'flex', flexDirection: 'column', gap: 2,
                  background: selectedLayerId === layer.id ? 'var(--color-surface-glass)' : 'transparent',
                  padding: '4px 6px', borderRadius: 4, margin: '0 -6px',
                  border: selectedLayerId === layer.id ? '1px solid var(--color-surface-border)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>{index + 1}:</span>
                    <input
                      value={layer.name}
                      onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed transparent', color: 'var(--color-text-primary)', fontSize: '0.65rem', outline: 'none', cursor: 'text', width: 120 }}
                      onFocus={(e) => { e.currentTarget.style.borderBottom = '1px dashed var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderBottom = '1px dashed transparent'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <button 
                      onClick={() => updateLayer(layer.id, { locked: !layer.locked })} 
                      style={{ background: 'none', border: 'none', color: layer.locked ? 'var(--color-error)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title={layer.locked ? "Desbloquear elemento" : "Bloquear elemento"}
                    >
                      {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    <button 
                      onClick={() => updateLayer(layer.id, { visible: !layer.visible })} 
                      style={{ background: 'none', border: 'none', color: !layer.visible ? 'var(--color-text-ghost)' : 'var(--color-text-primary)', cursor: 'pointer', padding: 2, marginLeft: 4 }}
                      title={layer.visible ? "Ocultar elemento" : "Mostrar elemento"}
                    >
                      {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                </div>
                <div style={trackStyle}>
                   <div 
                      className="timeline-track-block"
                      style={blockStyle(0, exportConfig.duration, 'rgba(0, 150, 255, 0.2)')}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, layerId: layer.id });
                        setSelectedLayerId(layer.id);
                      }}
                   >
                     <span style={{ margin: '0 auto', fontSize: '0.65rem', color: 'white', opacity: 0.8 }}>
                       0.0s - {(exportConfig.duration).toFixed(1)}s
                     </span>
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
                onClick={() => { setActiveAudioTrackId(track.id); setSelectedLayerId(null); }}
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
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed transparent', color: 'var(--color-text-primary)', fontSize: '0.65rem', outline: 'none', cursor: 'text', width: 120, userSelect: 'text' }}
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
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, layerId: track.id, isAudio: true });
                        setActiveAudioTrackId(track.id);
                      }}
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
             const layer = contextMenu.isAudio ? state.audioTracks.find(t => t.id === contextMenu.layerId) : state.layers.find(l => l.id === contextMenu.layerId);
             if (layer) state.setClipboard({ type: contextMenu.isAudio ? 'audio' : 'composition', data: layer });
             setContextMenu(null);
          }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 4, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <Copy size={12} /> Copiar (Cmd+C)
          </button>
          
          <button onClick={() => {
             const state = useEditorStore.getState();
             const layer = contextMenu.isAudio ? state.audioTracks.find(t => t.id === contextMenu.layerId) : state.layers.find(l => l.id === contextMenu.layerId);
             if (layer) {
               if (contextMenu.isAudio) {
                 const duplicate = { ...layer, id: crypto.randomUUID(), startTime: Math.min((layer as any).startTime + 0.5, exportConfig.duration) };
                 state.addAudioTrack(duplicate as any);
               } else {
                 state.duplicateLayer(layer.id);
               }
             }
             setContextMenu(null);
          }} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 4, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-surface-hover)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <Copy size={12} /> Duplicar
          </button>

          <button onClick={() => {
             const state = useEditorStore.getState();
             const layer = contextMenu.isAudio ? state.audioTracks.find(t => t.id === contextMenu.layerId) : state.layers.find(l => l.id === contextMenu.layerId);
             if (layer && contextMenu.isAudio && currentTime > (layer as any).startTime && currentTime < (layer as any).startTime + (layer as any).duration) {
               const newDuration1 = currentTime - (layer as any).startTime;
               const newDuration2 = ((layer as any).startTime + (layer as any).duration) - currentTime;
               state.updateAudioTrack(layer.id, { duration: newDuration1 });
               const duplicate = { ...layer, id: crypto.randomUUID(), startTime: currentTime, duration: newDuration2 };
               state.addAudioTrack(duplicate as any);
             }
             setContextMenu(null);
          }} style={{ background: 'none', border: 'none', color: contextMenu.isAudio && currentTime > (contextMenu.isAudio ? useEditorStore.getState().audioTracks.find(t => t.id === contextMenu.layerId)?.startTime || 0 : 0) ? 'var(--color-text-primary)' : 'var(--color-surface-border)', padding: '6px 12px', textAlign: 'left', cursor: contextMenu.isAudio ? 'pointer' : 'default', borderRadius: 4, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }} disabled={!contextMenu.isAudio} onMouseOver={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--color-surface-hover)')} onMouseOut={e => e.currentTarget.style.background = 'none'}>
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
