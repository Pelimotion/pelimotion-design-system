import { useRef } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { TypographyPreview } from '../Typography'
import { GenerativePreview } from '../Generative/GenerativePreview'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { useGSAP } from '@gsap/react'
import { TYPOGRAPHY_PRESETS } from '@/config/typography-presets'

gsap.registerPlugin(useGSAP, Draggable)

export function CompositionPreview() {
  const { activePanel, compositionLayers, audioTracks, localLibraryItems, currentTime, isPlaying, activeCompositionLayerId, setActiveCompositionLayerId, exportConfig } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({})

  // Sync Video playback with timeline
  useEffect(() => {
    compositionLayers.forEach(layer => {
      const isVisible = currentTime >= layer.startTime && currentTime <= layer.startTime + layer.duration;
      if (layer.type === 'cloudAsset') {
        const video = videoRefs.current[layer.id];
        if (video) {
          if (isVisible) {
            const localTime = (currentTime - layer.startTime) + (layer.trimStart || 0);
            if (Math.abs(video.currentTime - localTime) > 0.1) {
              video.currentTime = localTime;
            }
            if (isPlaying && video.paused) {
              video.play().catch(() => {});
            } else if (!isPlaying && !video.paused) {
              video.pause();
            }
          } else {
            if (!video.paused) video.pause();
          }
        }
      }
    });

    // Sync GSAP timelines globally for real-time playhead
    gsap.globalTimeline.time(currentTime);
  }, [currentTime, isPlaying, compositionLayers]);

  // Sync Audio playback with timeline
  useEffect(() => {
    audioTracks.forEach(track => {
      const audio = audioRefs.current[track.id];
      if (audio) {
        if (track.muted) {
           if (!audio.paused) audio.pause();
           return;
        }
        
        const isVisible = currentTime >= track.startTime && currentTime <= track.startTime + track.duration;
        if (isVisible) {
          const localTime = (currentTime - track.startTime) + (track.trimStart || 0);
          if (Math.abs(audio.currentTime - localTime) > 0.1) {
            audio.currentTime = localTime;
          }
          audio.volume = track.volume ?? 1;
          
          if (isPlaying && audio.paused) {
            audio.play().catch(() => {});
          } else if (!isPlaying && !audio.paused) {
            audio.pause();
          }
        } else {
          if (!audio.paused) audio.pause();
        }
      }
    });
  }, [currentTime, isPlaying, audioTracks]);

  // Playback Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      if (isPlaying) {
        const delta = (time - lastTime) / 1000;
        const state = useEditorStore.getState();
        let nextTime = state.currentTime + delta;
        if (nextTime >= state.exportConfig.duration) {
           nextTime = 0; // loop back to start
        }
        state.seek(nextTime);
      }
      lastTime = time;
      animationFrameId = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  // Draggable Setup
  useEffect(() => {
    const draggables: Draggable[] = [];
    compositionLayers.forEach((layer) => {
      const el = document.getElementById(`comp-layer-${layer.id}`);
      if (el) {
        gsap.set(el, {
          x: layer.transform.x,
          y: layer.transform.y,
          scale: layer.transform.scale,
          rotation: layer.transform.rotation,
          xPercent: -50,
          yPercent: -50,
          transformOrigin: 'center center'
        });

        const d = Draggable.create(el, {
          type: 'x,y',
          cursor: 'grab',
          activeCursor: 'grabbing',
          onPress: () => {
            useEditorStore.getState().setActiveCompositionLayerId(layer.id);
          },
          onDragStart: () => {
            useEditorStore.getState().setActiveCompositionLayerId(layer.id);
          },
          onDrag: function() {
            const currentLayer = useEditorStore.getState().compositionLayers.find(l => l.id === layer.id);
            if (currentLayer) {
              useEditorStore.getState().updateCompositionLayer(layer.id, {
                 transform: { ...currentLayer.transform, x: this.x, y: this.y }
              });
            }
          },
          onDragEnd: function() {
            const currentLayer = useEditorStore.getState().compositionLayers.find(l => l.id === layer.id);
            if (currentLayer) {
              useEditorStore.getState().updateCompositionLayer(layer.id, {
                 transform: { ...currentLayer.transform, x: this.x, y: this.y }
              });
            }
          },
        });
        draggables.push(...d);
      }
    });

    return () => {
      draggables.forEach(d => d.kill());
    };
  }, [compositionLayers.length]);

  // Sync state changes to GSAP
  useEffect(() => {
    compositionLayers.forEach((layer) => {
      const el = document.getElementById(`comp-layer-${layer.id}`);
      if (el) {
        gsap.set(el, {
          x: layer.transform.x,
          y: layer.transform.y,
          scale: layer.transform.scale,
          rotation: layer.transform.rotation,
        });
      }
    });
  }, [compositionLayers]);

  const handleContainerClick = () => {
    setActiveCompositionLayerId(null);
  }

  return (
    <div ref={containerRef} onClick={handleContainerClick} style={{ width: '100%', height: '100%', position: 'relative', filter: (exportConfig.enableMotionBlur && isPlaying) ? 'blur(0.8px) contrast(1.1)' : 'none', transition: 'filter 0.1s ease' }}>
      {compositionLayers.length === 0 ? (
        activePanel !== 'export' && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              textAlign: 'center',
              color: 'var(--canvas-text-primary, var(--color-text-secondary))',
              padding: 32,
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: 12
            }}>
              <h2>Cena de Composição</h2>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: 8 }}>
                Adicione itens da Biblioteca à Linha do Tempo.
              </p>
            </div>
          </div>
        )
      ) : (
        compositionLayers.map((layer, index) => {
          if (layer.hidden) return null;
          
          const isVisible = currentTime >= layer.startTime && currentTime <= layer.startTime + layer.duration;
          const localTime = currentTime - layer.startTime;
          const isActive = activeCompositionLayerId === layer.id;

          let content = null;

          if (layer.type === 'cloudAsset') {
            const isVideo = layer.assetId.endsWith('.mp4') || layer.assetId.endsWith('.mov') || layer.assetId.endsWith('.webm');
            if (isVideo) {
              const pullZone = import.meta.env.VITE_BUNNY_STORAGE_ZONE || 'pelimotion-zone';
              const videoSrc = `https://${pullZone}.b-cdn.net/${layer.assetId}`;
              content = (
                <video 
                  ref={el => { videoRefs.current[layer.id] = el; }}
                  className="composition-video-layer"
                  data-start-time={layer.startTime}
                  src={videoSrc} 
                  muted 
                  playsInline
                  crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              )
            }
          } else {
            let libraryItem = localLibraryItems.find(i => i.id === layer.assetId);
            
            // Fallback para presets originais da biblioteca
            if (!libraryItem) {
              const typoPreset = TYPOGRAPHY_PRESETS.find(p => p.id === layer.assetId);
              if (typoPreset) {
                libraryItem = { id: typoPreset.id, type: 'typography', data: typoPreset.config };
              }
            }

            if (libraryItem) {
              const playbackContext = { localTime, duration: layer.duration, isPlaying };
              if (libraryItem.type === 'typography') {
                content = <TypographyPreview overrideConfig={{ ...libraryItem.data, playbackContext }} />
              } else if (libraryItem.type === 'generative') {
                content = <GenerativePreview overrideConfig={{ motionConfig: { wiggle: libraryItem.data.globalWiggle }, generativeLayers: libraryItem.data.layers || [], playbackContext }} />
              }
            }
          }
          
          return (
            <div 
              key={layer.id}
              id={`comp-layer-${layer.id}`}
              data-gizmo-target={isActive ? 'active' : undefined}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCompositionLayerId(layer.id);
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                opacity: isVisible ? layer.transform.opacity : 0,
                display: isVisible ? 'block' : 'none',
                width: '100%', 
                height: '100%',
                pointerEvents: isVisible ? 'auto' : 'none',
                cursor: isActive ? 'move' : 'pointer',
                outline: isActive ? '2px solid var(--color-accent)' : 'none',
                zIndex: compositionLayers.length - index, // Track 1 (index 0) will have the highest z-index
              }}
            >
              {content || (
                <div style={{ background: 'rgba(255,0,0,0.5)', padding: 20 }}>
                  Invalid Asset: {layer.assetId}
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Invisible Audio Nodes */}
      {audioTracks.map(track => (
        <audio
          key={track.id}
          ref={el => { audioRefs.current[track.id] = el; }}
          src={track.src}
          preload="auto"
          style={{ display: 'none' }}
        />
      ))}
    </div>
  )
}
