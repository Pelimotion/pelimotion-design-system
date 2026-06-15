import { useEditorStore } from '@/store/useEditorStore'
import type { EditorPanel } from '@/types/motion.types'
import {
  Type,
  Layers,
  Film,
  Download,
  ChevronLeft,
  ChevronRight,
  Zap,
  MonitorPlay,
} from 'lucide-react'
import { TypographyPanel } from '@/components/TypographyPanel'
import { GenerativePanel } from '@/components/GenerativePanel'
import { LibraryPanel } from '@/components/LibraryPanel'
import { CompositionPanel } from '@/components/CompositionPanel'
import { ExportPanel } from '@/components/ExportPanel'
import { TypographyPreview } from '@/engines/Typography'
import { GenerativePreview } from '@/engines/Generative/GenerativePreview'
import { LibraryPreview } from '@/engines/Library/LibraryPreview'
import { CompositionPreview } from '@/engines/Composition/CompositionPreview'
import { ExportPreview } from '@/engines/Export/ExportPreview'
import { AudioEngine } from '@/engines/Audio/AudioEngine'
import { TopToolbar } from '@/components/TopToolbar'
import { GlobalGizmo } from '@/components/GlobalGizmo'
import { ViewportControls } from '@/components/ViewportControls'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { CompositionTimeline } from '@/components/CompositionTimeline'
import { CanvasGuides } from '@/components/CanvasGuides'
import React, { useState, useEffect, useRef } from 'react'
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { COLOR_PALETTES } from '@/config/color-palettes'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

// ─── Navigation Items ────────────────────────────────────────────────────────

interface NavItem {
  id: EditorPanel;
  label: string;
  icon: React.ReactNode;
  status: 'ready' | 'pending';
  phase: number;
}

const navItems: NavItem[] = [
  { id: 'typography', label: 'Tipografia', icon: <Type size={18} />, status: 'ready', phase: 2 },
  { id: 'generative', label: 'Generativo', icon: <Layers size={18} />, status: 'ready', phase: 3 },
  { id: 'library', label: 'Biblioteca', icon: <Film size={18} />, status: 'ready', phase: 4 },
  { id: 'composition', label: 'Composição', icon: <MonitorPlay size={18} />, status: 'ready', phase: 5 },
  { id: 'export', label: 'Exportar', icon: <Download size={18} />, status: 'ready', phase: 6 },
]

// ─── App Component ───────────────────────────────────────────────────────────

function App() {
  useKeyboardShortcuts()
  
  const {
    motionConfig,
    activePanel,
    setActivePanel,
    sidebarCollapsed,
    toggleSidebar,
    exportConfig,
    camera,
  } = useEditorStore()

  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [sidebarResizing, setSidebarResizing] = useState(false)
  const isResizing = useRef(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      useEditorStore.getState().applyColorPalette(COLOR_PALETTES.find(p => p.id === 'cyberpunk') || COLOR_PALETTES[0]!)
      
      // Load crash recovery state
      try {
        const saved = localStorage.getItem('pelimotion_autosave');
        if (saved) {
          const parsed = JSON.parse(saved);
          useEditorStore.getState().restoreState(parsed);
        }
      } catch (err) {
        console.warn('[Auto-Save] Failed to restore state from autosave', err);
      }

      initialized.current = true
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = Math.max(200, Math.min(600, e.clientX - 8))
      setSidebarWidth(newWidth)
    }
    const handleMouseUp = () => {
      isResizing.current = false
      setSidebarResizing(false)
      document.body.style.cursor = 'default'
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const [tick, setTick] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!viewportRef.current) return
    const updateSize = () => {
      setTick(t => t + 1)
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const targetW = parseInt(exportConfig.resolution?.split('x')[0] || '1920', 10)
  const targetH = parseInt(exportConfig.resolution?.split('x')[1] || '1080', 10)

  // ─── Auto-Save Persistence (Crash Recovery) ──────────────────────────────
  useEffect(() => {
    // 1. Boot Restoration
    try {
      const saved = localStorage.getItem('pelimotion_autosave');
      if (saved) {
        const payload = JSON.parse(saved);
        if (payload.compositionLayers && payload.compositionLayers.length > 0) {
          useEditorStore.getState().restoreState(payload);
          console.log('[Auto-Save] Session restored from LocalStorage.');
        }
      }
    } catch(err) {
      console.warn('[Auto-Save] Boot restoration failed', err);
    }

    // 2. Continuous Auto-Save
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useEditorStore.subscribe((state) => {
      // Debounce the save to LocalStorage
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const payload = JSON.stringify({
            compositionLayers: state.compositionLayers,
            audioTracks: state.audioTracks,
            exportConfig: state.exportConfig
          });
          localStorage.setItem('pelimotion_autosave', payload);
        } catch (err) {
          console.warn('[Auto-Save] Error persisting state', err);
        }
      }, 5000);
    });
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  // ─── Spatial Navigation (Pan & Zoom) ───────────────────────────────────────
  const isSpaceDown = useRef(false);
  const isPanning = useRef(false);
  const hasDraggedWithSpace = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isSpaceDown.current) {
          isSpaceDown.current = true;
          hasDraggedWithSpace.current = false;
          if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
        }
      } else if (e.code === 'Backspace' || e.code === 'Delete') {
        const store = useEditorStore.getState();
        if (store.activeCompositionLayerId) {
          store.removeCompositionLayer(store.activeCompositionLayerId);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDown.current = false;
        isPanning.current = false;
        if (viewportRef.current) viewportRef.current.style.cursor = 'default';
        
        // Se não arrastou o canvas durante o space, foi só um clique (tap) para Play/Pause
        if (!hasDraggedWithSpace.current) {
          const store = useEditorStore.getState();
          store.togglePlayback();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent native zoom/scroll
      const state = useEditorStore.getState();
      const currentCamera = state.camera;

      if (e.ctrlKey || e.metaKey) {
        // Zoom-to-Mouse-Position (Figma & After Effects style)
        const zoomSensitivity = 0.005;
        const newZ = Math.max(0.1, Math.min(10, currentCamera.z - e.deltaY * zoomSensitivity));
        
        const { resolution } = state.exportConfig;
        const [wStr, hStr] = (resolution || "1920x1080").split('x');
        const targetW = parseInt(wStr || "1920", 10);
        const targetH = parseInt(hStr || "1080", 10);
        
        const availableW = window.innerWidth - 320 - 48;
        const availableH = window.innerHeight - 80 - 48;
        const fitScale = Math.min(availableW / targetW, availableH / targetH);
        
        const rect = viewport.getBoundingClientRect();
        // Mouse coordinate relative to the viewport center
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        
        // Target canvas point coordinate under the mouse before zoom
        const mx_canvas = (mouseX - currentCamera.x) / (currentCamera.z * fitScale);
        const my_canvas = (mouseY - currentCamera.y) / (currentCamera.z * fitScale);
        
        // Offset camera position to keep the canvas coordinate static under the mouse cursor after new zoom
        const newX = currentCamera.x - mx_canvas * (newZ * fitScale - currentCamera.z * fitScale);
        const newY = currentCamera.y - my_canvas * (newZ * fitScale - currentCamera.z * fitScale);
        
        state.setCamera({
          x: newX,
          y: newY,
          z: newZ
        });
      } else {
        // Pan
        state.setCamera({
          x: currentCamera.x - e.deltaX * 1.0,
          y: currentCamera.y - e.deltaY * 1.0
        });
      }
    };

    // Passive false is crucial for e.preventDefault() to work on wheel
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSpaceDown.current || e.button === 1) { // Space + Click or Middle Click
      isPanning.current = true;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning.current) {
      if (isSpaceDown.current) {
        hasDraggedWithSpace.current = true;
      }
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      const state = useEditorStore.getState();
      state.setCamera({
        x: state.camera.x + dx,
        y: state.camera.y + dy
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning.current) {
      isPanning.current = false;
      if (viewportRef.current) viewportRef.current.style.cursor = isSpaceDown.current ? 'grab' : 'default';
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  useGSAP(() => {
    if (activePanel === 'library') return;
    
    let fitScale = 1;
    if (typeof targetW === 'number' && typeof targetH === 'number') {
      const availableW = window.innerWidth - 320 - 48; // Sidebar + padding
      const availableH = window.innerHeight - 80 - 48; // Header + padding
      fitScale = Math.min(availableW / targetW, availableH / targetH);
    }
    
    const finalScale = camera.z * fitScale;
    document.documentElement.style.setProperty('--inverse-scale', (1 / finalScale).toString());
    
    gsap.set('#canvas-fixed-resolution', {
      x: camera.x,
      y: camera.y,
      xPercent: -50,
      yPercent: -50,
      scale: finalScale,
      transformOrigin: '50% 50%'
    });
  }, [camera, targetW, targetH, activePanel, tick]);

  const canvasArea = (
    <div
      id="canvas-viewport"
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        try {
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            Array.from(e.dataTransfer.files).forEach(file => {
              const url = URL.createObjectURL(file);
              const isVideo = file.type.startsWith('video/');
              const isImage = file.type.startsWith('image/');
              const isAudio = file.type.startsWith('audio/');
              const assetId = crypto.randomUUID();
              const state = useEditorStore.getState();

              if (isVideo || isImage) {
                state.saveToLocalLibrary({
                  id: assetId,
                  name: file.name,
                  type: isVideo ? 'video' : 'image',
                  createdAt: Date.now(),
                  data: url
                });
                state.addCompositionLayer({
                  id: crypto.randomUUID(),
                  name: file.name,
                  type: 'localAsset',
                  assetId: assetId,
                  startTime: state.currentTime,
                  duration: 5,
                  transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
                });
              } else if (isAudio) {
                state.saveToLocalLibrary({
                  id: assetId,
                  name: file.name,
                  type: 'audio',
                  createdAt: Date.now(),
                  data: url
                });
                state.addAudioTrack({
                  id: crypto.randomUUID(),
                  name: file.name,
                  src: url,
                  startTime: state.currentTime,
                  duration: 10,
                  volume: 1,
                });
              }
            });
            return;
          }

          const dataStr = e.dataTransfer.getData('application/json');
          if (dataStr) {
            const data = JSON.parse(dataStr);
            if (data && data.id) {
              useEditorStore.getState().addCompositionLayer({
                id: crypto.randomUUID(),
                name: data.name,
                type: data.type || 'cloudAsset',
                assetId: data.id,
                startTime: useEditorStore.getState().currentTime,
                duration: 3,
                transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
              });
            }
          }
        } catch(err) {
          console.error('Drop error', err);
        }
      }}
      className="glass-panel animate-fade-in stagger-2 animate-pulse-glow"
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        touchAction: 'none', // Prevent browser gestures on the canvas
      }}
    >
      <ViewportControls />
      <div
        id="canvas-fixed-resolution"
        style={{
          width: targetW,
          height: targetH,
          position: 'absolute',
          top: '50%',
          left: '50%',
          overflow: 'hidden',
          backgroundColor: exportConfig.backgroundColor,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          containerType: 'inline-size', // Enables cqw for Typography and other layers
        }}
      >
      {/* Background Media Layer */}
      {activePanel !== 'export' && exportConfig.backgroundImageUrl && (
        <>
          {exportConfig.backgroundType === 'image' ? (
            <img
              src={exportConfig.backgroundImageUrl}
              alt="bg"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                ...(exportConfig.aspectRatioMode === 'manual' ? {
                  transform: `translate(${exportConfig.overlayX}px, ${exportConfig.overlayY}px) scale(${exportConfig.overlayScale})`,
                } : {
                  objectFit: exportConfig.aspectRatioMode === 'fit' ? 'contain' : 'cover'
                })
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <video
              src={exportConfig.backgroundImageUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                ...(exportConfig.aspectRatioMode === 'manual' ? {
                  transform: `translate(${exportConfig.overlayX}px, ${exportConfig.overlayY}px) scale(${exportConfig.overlayScale})`,
                } : {
                  objectFit: exportConfig.aspectRatioMode === 'fit' ? 'contain' : 'cover'
                })
              }}
              crossOrigin="anonymous"
            />
          )}
        </>
      )}

      {/* Breathing Animated Mesh Background */}
      <style>{`
        @keyframes breathing-mesh {
          0% { background-position: 0 0; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0 0; }
        }
      `}</style>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.05) 0%, transparent 40%)
        `,
        backgroundSize: '200% 200%',
        animation: 'breathing-mesh 15s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* GlobalGizmo — direct child of canvas-viewport so position:absolute anchors to canvas top-left */}
      <GlobalGizmo />

      {/* CanvasGuides — aspect ratio safe zone overlay */}
      <CanvasGuides />

      {/* Center Content */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}>
        {activePanel === 'typography' ? (
          <TypographyPreview />
        ) : activePanel === 'generative' ? (
          <GenerativePreview />
        ) : activePanel === 'composition' ? (
          <CompositionPreview />
        ) : activePanel === 'export' ? (
          <ExportPreview />
        ) : (
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            {/* Logo mark */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--color-accent), #7c3aed, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 40px hsla(191, 100%, 50%, 0.2), 0 0 80px hsla(271, 76%, 53%, 0.1)',
            }}>
              <MonitorPlay size={26} color="#fff" />
            </div>

            <h1 style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              marginBottom: 6,
            }}>
              Pelimotion
            </h1>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              marginBottom: 28,
            }}>
              Editor de motion design generativo, direto no browser.
            </p>

            {/* Quick-start cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginBottom: 20,
            }}>
              {[
                {
                  panel: 'typography' as const,
                  label: 'Tipografia',
                  icon: <Type size={18} />,
                  desc: 'Crie textos animados com efeitos de entrada e saída',
                  color: 'hsla(191,100%,50%,0.12)',
                  border: 'hsla(191,100%,50%,0.2)',
                  accent: 'var(--color-accent)',
                },
                {
                  panel: 'generative' as const,
                  label: 'Generativo',
                  icon: <Layers size={18} />,
                  desc: 'Gere formas, grades e padrões animados',
                  color: 'hsla(271,76%,53%,0.12)',
                  border: 'hsla(271,76%,53%,0.2)',
                  accent: '#7c3aed',
                },
                {
                  panel: 'composition' as const,
                  label: 'Composição',
                  icon: <MonitorPlay size={18} />,
                  desc: 'Monte cenas com vídeos, imagens e áudio',
                  color: 'hsla(330,80%,60%,0.1)',
                  border: 'hsla(330,80%,60%,0.18)',
                  accent: '#ec4899',
                },
              ].map((item) => (
                <div
                  key={item.panel}
                  onClick={() => setActivePanel(item.panel)}
                  style={{
                    background: item.color,
                    border: `1px solid ${item.border}`,
                    borderRadius: 12,
                    padding: '14px 12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s var(--ease-smooth)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ color: item.accent }}>{item.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-ghost)', lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Keyboard hints */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
              fontSize: '0.68rem',
              color: 'var(--color-text-ghost)',
            }}>
              {[
                { key: 'Espaço', desc: 'Play/Pause' },
                { key: 'Ctrl+Scroll', desc: 'Zoom' },
                { key: 'Espaço+Drag', desc: 'Pan' },
                { key: 'Del', desc: 'Deletar camada' },
              ].map(({ key, desc }) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <kbd className="kbd-badge">{key}</kbd>
                  <span>{desc}</span>
                </span>
              ))}
            </div>
          </div>

        )}
      </div>
      </div>
    </div>
  )

  return (
    <div id="app-shell" style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      background: 'linear-gradient(145deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
    }}>

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        id="sidebar"
        className="glass-panel animate-fade-in"
        style={{
          width: sidebarCollapsed ? 56 : sidebarWidth,
          minWidth: sidebarCollapsed ? 56 : sidebarWidth,
          margin: 8,
          marginRight: 0,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transition: sidebarResizing ? 'none' : 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {!sidebarCollapsed && (
          <div
            onMouseDown={() => {
              isResizing.current = true
              setSidebarResizing(true)
              document.body.style.cursor = 'col-resize'
            }}
            className="sidebar-resize-handle"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 6,
              height: '100%',
              cursor: 'col-resize',
              zIndex: 100,
            }}
          />
        )}
        {/* Header */}
        <div style={{
          padding: sidebarCollapsed ? '16px 12px' : '20px 16px',
          borderBottom: '1px solid var(--color-surface-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, var(--color-accent), #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}>
                  <Zap size={13} color="#fff" />
                </div>
                <span style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.01em',
                  color: 'var(--color-text-primary)',
                }}>
                  Pelimotion
                </span>
                <span style={{
                  fontWeight: 400,
                  fontSize: '0.95rem',
                  color: 'var(--color-text-muted)',
                }}>
                  Design System
                </span>
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--color-text-ghost)',
                marginTop: 4,
                fontFamily: 'var(--font-mono)',
              }}>
                v{motionConfig.version}
              </div>
            </div>
          )}
          <button
            id="toggle-sidebar"
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--duration-fast) var(--ease-smooth)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ padding: 8 }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${activePanel === item.id ? 'nav-item--active' : ''}`}
              title={item.label}
              onClick={() => {
                setActivePanel(item.id)
                if (sidebarCollapsed) {
                  toggleSidebar()
                }
              }}
              style={{
                marginBottom: 2,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span className={`status-badge status-badge--${item.status}`}>
                    {item.status === 'ready' ? 'Ready' : `P${item.phase}`}
                  </span>
                </>
              )}
            </div>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <>
            <div style={{ height: 1, background: 'var(--color-surface-border)', margin: '0 8px' }} />
            
            {/* Active Panel Controls */}
            <div style={{ flex: 1, overflow: 'hidden', padding: 16, display: 'flex', flexDirection: 'column' }}>
              {activePanel === 'typography' && <TypographyPanel />}
              {activePanel === 'generative' && <GenerativePanel />}
              {activePanel === 'library' && <LibraryPanel />}
              {activePanel === 'composition' && <CompositionPanel />}
              {activePanel === 'export' && <ExportPanel />}
              {activePanel !== 'typography' && activePanel !== 'generative' && activePanel !== 'library' && activePanel !== 'composition' && activePanel !== 'export' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--color-text-ghost)',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                }}>
                  Controls for {activePanel} will be unlocked in a future phase.
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      {/* ─── Main Content Area ────────────────────────────────────────────── */}
      <main
        id="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          margin: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <TopToolbar />
        
        {activePanel === 'library' ? (
          <div className="glass-panel animate-fade-in custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <LibraryPreview />
          </div>
        ) : activePanel === 'composition' ? (
          <PanelGroup orientation="vertical" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Panel defaultSize={65} minSize={30} style={{ display: 'flex', flexDirection: 'column', paddingBottom: 4 }}>
              {canvasArea}
            </Panel>
            
            <PanelResizeHandle
              className="timeline-resize-handle"
              style={{
                height: 10,
                cursor: 'row-resize',
                position: 'relative',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            
            <Panel defaultSize={35} minSize={20} style={{ display: 'flex', flexDirection: 'column', paddingTop: 4 }}>
              <div className="glass-panel animate-fade-in custom-scrollbar" style={{ padding: '16px 24px', borderRadius: 'var(--radius-lg)', flex: 1, overflowY: 'auto' }}>
                <CompositionTimeline />
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          canvasArea
        )}

        {/* Bottom Info Bar */}
        <footer
          id="status-bar"
          className="animate-fade-in stagger-5"
          style={{
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-ghost)',
          }}
        >
          <span>crossOriginIsolated: {typeof crossOriginIsolated !== 'undefined' ? String(crossOriginIsolated) : 'N/A'}</span>
          <span>GSAP + Zustand + Simplex Noise</span>
          <span>Apple Silicon Optimized</span>
        </footer>
      </main>
      
      {/* Headless Audio Engine - Plays globally regardless of active panel */}
      <AudioEngine />
    </div>
  )
}

export default App
