/**
 * App — Pelimotion v3.0
 *
 * Figma-inspired 3-zone layout:
 *   [TopBar]
 *   [LayersPanel] | [Canvas] | [PropertiesPanel]
 *   [ExportBar]
 *
 * All Pro features (NLE Timeline, Composition, Audio) are preserved
 * and conditionally shown via feature flags.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// New v3.0 components
import { TopBar } from '@/components/TopBar';
import { LayersPanel } from '@/components/LayersPanel';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { ExportBar } from '@/components/ExportBar';

// Canvas rendering layer
import { UniversalCanvasPreview } from '@/components/UniversalCanvasPreview';

// Shared UI components (preserved)
import { GlobalGizmo } from '@/components/GlobalGizmo';
import { ViewportControls } from '@/components/ViewportControls';
import { CanvasGuides } from '@/components/CanvasGuides';
import { AudioEngine } from '@/engines/Audio/AudioEngine';

// Library modal
import { LibraryModal } from '@/components/LibraryModal';

// Pro feature imports (conditionally shown via feature flags)
import { CompositionTimeline } from '@/components/CompositionTimeline';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { COLOR_PALETTES } from '@/config/color-palettes';
import { ToastContainer } from '@/components/ToastNotification';

gsap.registerPlugin(useGSAP);

// ─── App Component ───────────────────────────────────────────────────────────

function App() {
  useKeyboardShortcuts();

  const {
    exportConfig, camera, featureFlags, libraryModalOpen,
    setLibraryModalOpen, referenceImage, exportState,
    canvasPreviewTheme,
  } = useEditorStore();

  const viewportRef = useRef<HTMLDivElement>(null);
  const isSpaceDown = useRef(false);
  const isPanning = useRef(false);
  const hasDraggedWithSpace = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  // ─── Initialization ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      // Apply default color palette
      useEditorStore.getState().applyColorPalette(
        COLOR_PALETTES.find(p => p.id === 'cyberpunk') ?? COLOR_PALETTES[0]!
      );

      // Crash recovery
      try {
        const saved = localStorage.getItem('pelimotion_autosave');
        if (saved) {
          const parsed = JSON.parse(saved);
          useEditorStore.getState().restoreState(parsed);
        }
      } catch { /* ignore */ }
    }
  }, []);

  // ─── Auto-save ───────────────────────────────────────────────────────────

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useEditorStore.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem('pelimotion_autosave', JSON.stringify({
            compositionLayers: state.compositionLayers,
            audioTracks: state.audioTracks,
            exportConfig: state.exportConfig,
            layers: state.layers,
          }));
        } catch { /* quota exceeded */ }
      }, 4000);
    });
    return () => { unsub(); clearTimeout(timer); };
  }, []);

  // ─── Canvas dimensions ───────────────────────────────────────────────────

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onResize = () => setTick(t => t + 1);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const targetW = parseInt(exportConfig.resolution?.split('x')[0] ?? '1920', 10);
  const targetH = parseInt(exportConfig.resolution?.split('x')[1] ?? '1080', 10);

  // ─── Spatial Camera (pan + zoom) ─────────────────────────────────────────

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
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDown.current = false;
        isPanning.current = false;
        if (viewportRef.current) viewportRef.current.style.cursor = 'default';
        if (!hasDraggedWithSpace.current) {
          useEditorStore.getState().togglePlayback();
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
    const vp = viewportRef.current;
    if (!vp) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const state = useEditorStore.getState();
      const cam = state.camera;
      if (e.ctrlKey || e.metaKey) {
        const sens = 0.005;
        const newZ = Math.max(0.1, Math.min(10, cam.z - e.deltaY * sens));
        const avW = window.innerWidth - 520 - 32;
        const avH = window.innerHeight - 96 - 96;
        const fitScale = Math.min(avW / targetW, avH / targetH);
        const rect = vp.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        const mxc = (mx - cam.x) / (cam.z * fitScale);
        const myc = (my - cam.y) / (cam.z * fitScale);
        state.setCamera({
          x: cam.x - mxc * (newZ * fitScale - cam.z * fitScale),
          y: cam.y - myc * (newZ * fitScale - cam.z * fitScale),
          z: newZ,
        });
      } else {
        state.setCamera({ x: cam.x - e.deltaX, y: cam.y - e.deltaY });
      }
    };
    vp.addEventListener('wheel', handleWheel, { passive: false });
    return () => vp.removeEventListener('wheel', handleWheel);
  }, [targetW, targetH]);

  const handleCanvasSelection = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // Don't select if clicking on Gizmo handles, toolbar, or other UI controls
    if (
      target.closest('.gizmo-handle') || 
      target.closest('#floating-toolbar') || 
      target.closest('#export-bar') || 
      target.closest('#top-bar') || 
      target.closest('#layers-panel') || 
      target.closest('#properties-panel')
    ) {
      return;
    }

    // 1. Temporarily set pointer-events: auto on all layer elements to enable hit testing
    const layerEls = document.querySelectorAll('[data-layer-id]');
    layerEls.forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'auto';
    });

    // 2. Perform hit test at client coordinates
    const hitEl = document.elementFromPoint(e.clientX, e.clientY);

    // 3. Restore pointer-events: none (except currently selected/editing layers which manage it themselves)
    layerEls.forEach(el => {
      const isEditing = el.getAttribute('contenteditable') === 'true';
      const isSelected = el.getAttribute('data-gizmo-target') === 'active';
      (el as HTMLElement).style.pointerEvents = (isSelected || isEditing) ? 'auto' : 'none';
    });

    // 4. Find the closest wrapper with data-layer-id
    const clickedLayerEl = hitEl?.closest('[data-layer-id]');
    if (clickedLayerEl) {
      const layerId = clickedLayerEl.getAttribute('data-layer-id');
      if (layerId) {
        useEditorStore.getState().setSelectedLayerId(layerId);
        return;
      }
    }

    // 5. Clicked empty space -> deselect
    useEditorStore.getState().setSelectedLayerId(null);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSpaceDown.current || e.button === 1) {
      isPanning.current = true;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      if (viewportRef.current) viewportRef.current.style.cursor = 'grabbing';
      e.currentTarget.setPointerCapture(e.pointerId);
      document.body.classList.add('dragging-active');
    } else {
      handleCanvasSelection(e);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.gizmo-handle') || 
      target.closest('#floating-toolbar') || 
      target.closest('#export-bar') || 
      target.closest('#top-bar') || 
      target.closest('#layers-panel') || 
      target.closest('#properties-panel')
    ) {
      return;
    }

    const layerEls = document.querySelectorAll('[data-layer-id]');
    layerEls.forEach(el => {
      (el as HTMLElement).style.pointerEvents = 'auto';
    });

    const hitEl = document.elementFromPoint(e.clientX, e.clientY);

    layerEls.forEach(el => {
      const isEditing = el.getAttribute('contenteditable') === 'true';
      const isSelected = el.getAttribute('data-gizmo-target') === 'active';
      (el as HTMLElement).style.pointerEvents = (isSelected || isEditing) ? 'auto' : 'none';
    });

    const clickedLayerEl = hitEl?.closest('[data-layer-id]');
    if (clickedLayerEl) {
      const layerId = clickedLayerEl.getAttribute('data-layer-id');
      if (layerId) {
        useEditorStore.getState().setSelectedLayerId(layerId);
        clickedLayerEl.dispatchEvent(new CustomEvent('trigger-text-edit'));
        return;
      }
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    if (isSpaceDown.current) hasDraggedWithSpace.current = true;
    const dx = e.clientX - lastPanPos.current.x;
    const dy = e.clientY - lastPanPos.current.y;
    lastPanPos.current = { x: e.clientX, y: e.clientY };
    const s = useEditorStore.getState();
    s.setCamera({ x: s.camera.x + dx, y: s.camera.y + dy });
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    isPanning.current = false;
    if (viewportRef.current) viewportRef.current.style.cursor = isSpaceDown.current ? 'grab' : 'default';
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.classList.remove('dragging-active');
  };

  // ─── GSAP Camera Apply ───────────────────────────────────────────────────

  useGSAP(() => {
    const avW = window.innerWidth - 520 - 32;
    const avH = window.innerHeight - 96 - 96;
    const fitScale = Math.min(avW / targetW, avH / targetH);
    const finalScale = camera.z * fitScale;
    document.documentElement.style.setProperty('--inverse-scale', (1 / finalScale).toString());
    gsap.set('#canvas-fixed-resolution', {
      x: camera.x, y: camera.y,
      xPercent: -50, yPercent: -50,
      scale: finalScale, transformOrigin: '50% 50%',
    });
  }, [camera, targetW, targetH, tick]);

  // ─── Canvas Area ─────────────────────────────────────────────────────────

  const canvasArea = (
    <div
      id="canvas-viewport"
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const state = useEditorStore.getState();
        files.forEach(file => {
          const url = URL.createObjectURL(file);
          const isImg = file.type.startsWith('image/');
          const isVid = file.type.startsWith('video/');
          const isAud = file.type.startsWith('audio/');
          const assetId = crypto.randomUUID();
          if (isImg || isVid) {
            state.saveToLocalLibrary({ id: assetId, name: file.name, type: isVid ? 'video' : 'image', createdAt: Date.now(), data: url });
            state.addCompositionLayer({ id: crypto.randomUUID(), name: file.name, type: 'localAsset', assetId, startTime: state.currentTime, duration: 5, transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 } });
          } else if (isAud) {
            state.saveToLocalLibrary({ id: assetId, name: file.name, type: 'audio', createdAt: Date.now(), data: url });
            state.addAudioTrack({ id: crypto.randomUUID(), name: file.name, src: url, startTime: state.currentTime, duration: 10, volume: 1 });
          }
        });
      }}
      style={{
        flex: 1, minWidth: 0, minHeight: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        touchAction: 'none',
      }}
    >
      <ViewportControls />
      <div
        id="canvas-fixed-resolution"
        style={{
          width: targetW, height: targetH,
          position: 'absolute', top: '50%', left: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 80px rgba(0,0,0,0.6)',
          containerType: 'inline-size',
          ...(exportState.isExporting ? {
            backgroundColor: exportConfig.backgroundColor,
          } : canvasPreviewTheme === 'light' ? {
            backgroundColor: '#ffffff',
          } : canvasPreviewTheme === 'transparent' ? {
            backgroundImage: 'linear-gradient(45deg, #181818 25%, transparent 25%), linear-gradient(-45deg, #181818 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181818 75%), linear-gradient(-45deg, transparent 75%, #181818 75%)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            backgroundColor: '#0f0f0f',
          } : {
            backgroundColor: '#050505',
          })
        }}
      >
        {/* Background media */}
        {exportConfig.backgroundImageUrl && (
          exportConfig.backgroundType === 'image' ? (
            <img src={exportConfig.backgroundImageUrl} alt="bg" crossOrigin="anonymous"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none',
                objectFit: exportConfig.aspectRatioMode === 'fit' ? 'contain' : 'cover' }} />
          ) : (
            <video src={exportConfig.backgroundImageUrl} autoPlay loop muted playsInline crossOrigin="anonymous"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none',
                objectFit: exportConfig.aspectRatioMode === 'fit' ? 'contain' : 'cover' }} />
          )
        )}

        {/* Universal Canvas Preview (renders all UniversalLayers) */}
        <UniversalCanvasPreview />

        {/* Reference image overlay (semi-transparent, not exported) */}
        {referenceImage && !exportState.isExporting && (
          <img
            src={referenceImage}
            alt="reference overlay"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: exportConfig.aspectRatioMode === 'fit' ? 'contain' : 'cover',
              opacity: 0.3,
              zIndex: 89, // just behind watermark but above previews
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Watermark for free tier preview */}
        {exportConfig.includeWatermark !== false && (
          <div
            data-testid="watermark"
            className="watermark"
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              zIndex: 90,
              pointerEvents: 'none',
              fontSize: '2cqw',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.3)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              userSelect: 'none',
            }}
          >
            Pelimotion
          </div>
        )}

        {/* Gizmo & Guides */}
        <GlobalGizmo />
        <CanvasGuides />
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div id="app-shell" style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '100vw', overflow: 'hidden',
      background: 'var(--color-bg-primary)',
    }}>
      {/* Top Bar */}
      <TopBar />

      {/* Main Editor: 3 zones */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'row',
      }}>
        {/* Left: Layers Panel */}
        <div
          id="layers-panel"
          style={{
            width: 220, flexShrink: 0,
            borderRight: '1px solid var(--color-surface-border)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--color-bg-secondary)',
            overflowY: 'auto',
          }}
        >
          <LayersPanel />
        </div>

        {/* Center: Canvas + optional NLE Timeline below */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          {featureFlags.timeline_nle ? (
            <>
              {/* Canvas takes ~65% */}
              <div style={{ flex: 65, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{canvasArea}</div>
              {/* Resize handle */}
              <div style={{ height: 8, background: 'var(--color-surface-border)', cursor: 'row-resize', flexShrink: 0 }} />
              {/* NLE Timeline */}
              <div style={{
                flex: 35, minHeight: 0,
                borderTop: '1px solid var(--color-surface-border)',
                background: 'var(--color-bg-secondary)',
                overflowY: 'auto',
                padding: '8px 16px',
              }}>
                <CompositionTimeline />
              </div>
            </>
          ) : (
            canvasArea
          )}

          {/* Export Bar */}
          <ExportBar />
        </div>

        {/* Right: Properties Panel */}
        <div
          id="properties-panel"
          style={{
            width: 240, flexShrink: 0,
            borderLeft: '1px solid var(--color-surface-border)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--color-bg-secondary)',
            overflowY: 'auto',
            transition: 'width 0.2s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <PropertiesPanel />
        </div>
      </div>

      {/* Library Modal (full-screen overlay) */}
      {libraryModalOpen && <LibraryModal onClose={() => setLibraryModalOpen(false)} />}

      {/* Toast Notification System */}
      <ToastContainer />

      {/* Headless Audio Engine */}
      <AudioEngine />
    </div>
  );
}

export default App;
