import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { gsap } from 'gsap';
import { FloatingToolbar } from './FloatingToolbar';
import { InteractiveGizmo } from './InteractiveGizmo';

/**
 * GlobalGizmo — Figma/After Effects style HUD overlay
 *
 * KEY DESIGN DECISIONS:
 * - Position/size from getBoundingClientRect() = always pixel-perfect regardless of CSS layout mode
 * - Only rotation comes from GSAP (CSS transforms don't report rotation in boundingRect)
 * - visibleRef prevents React re-renders on every tick (60fps DOM mutations only)
 * - Resets fully when active layer or layout mode changes
 */
export function GlobalGizmo() {
  const {
    showGizmo,
    selectedLayerId,
    layers,
    updateLayer,
    activeTypoLayerId,
    activeGenerativeLayerId,
    activeCompositionLayerId,
    updateTypoLayerTransform,
    updateLayerTransform,
    updateCompositionLayer,
    motionConfig,
    generativeLayers,
    compositionLayers,
  } = useEditorStore();

  const layoutMode = motionConfig.typography.layoutMode;

  const [rect, setRect] = useState<{ width: number; height: number } | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  // Track last known active ID + layoutMode so we can reset on change
  const lastTargetKeyRef = useRef('');

  useEffect(() => {
    const updateGizmo = () => {
      const target = document.querySelector('[data-gizmo-target="active"]') as HTMLElement;
      targetRef.current = target;

      // Compute a key that represents "which thing is selected in which mode"
      const currentKey = `${selectedLayerId || activeTypoLayerId || activeGenerativeLayerId || activeCompositionLayerId || 'none'}::${layoutMode}`;

      // If target changed (layer switch or layout mode change) → force a fresh mount
      if (currentKey !== lastTargetKeyRef.current) {
        lastTargetKeyRef.current = currentKey;
        if (visibleRef.current) {
          if (containerRef.current) containerRef.current.style.display = 'none';
          visibleRef.current = false;
          setRect(null);
        }
      }

      if (!target || !showGizmo || !containerRef.current) {
        if (visibleRef.current) {
          if (containerRef.current) containerRef.current.style.display = 'none';
          visibleRef.current = false;
          setRect(null);
        }
        return;
      }

      const canvasViewport = document.getElementById('canvas-fixed-resolution') || document.getElementById('canvas-viewport');
      if (!canvasViewport) return;

      // Use getBoundingClientRect for pixel-perfect size (includes CSS scale, flex sizing, etc.)
      const targetBounds = target.getBoundingClientRect();
      const canvasBounds = canvasViewport.getBoundingClientRect();

      // Skip if element has no size (not yet rendered)
      if (targetBounds.width < 1 || targetBounds.height < 1) return;

      // Un-scale the coordinates because the gizmo itself is inside the scaled container
      const scaleX = canvasBounds.width / canvasViewport.offsetWidth;
      const scaleY = canvasBounds.height / canvasViewport.offsetHeight;

      // Only rotation is from GSAP (boundingRect doesn't expose rotation)
      const rotation = (gsap.getProperty(target, 'rotation') as number) || 0;

      // Center of the rendered target, relative to canvas top-left, un-scaled
      const centerX = ((targetBounds.left - canvasBounds.left) + targetBounds.width / 2) / scaleX;
      const centerY = ((targetBounds.top - canvasBounds.top) + targetBounds.height / 2) / scaleY;

      const gizmoW = targetBounds.width / scaleX;
      const gizmoH = targetBounds.height / scaleY;

      // Apply position/size/rotation via GSAP (no React overhead per tick)
      gsap.set(containerRef.current, {
        x: centerX,
        y: centerY,
        xPercent: -50,
        yPercent: -50,
        rotation,
        width: gizmoW,
        height: gizmoH,
      });

      if (!visibleRef.current) {
        containerRef.current.style.display = 'block';
        visibleRef.current = true;
        setRect({ width: gizmoW, height: gizmoH });
      }
    };

    gsap.ticker.add(updateGizmo);
    return () => gsap.ticker.remove(updateGizmo);
    // Re-run when showGizmo, active IDs, or layout mode change
  }, [showGizmo, selectedLayerId, activeTypoLayerId, activeGenerativeLayerId, activeCompositionLayerId, layoutMode]);

  if (!showGizmo) return null;

  let currentLayerScale = 1;
  let currentLayerRotation = 0;

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  if (selectedLayer) {
    currentLayerScale = selectedLayer.transform.scale;
    currentLayerRotation = selectedLayer.transform.rotation;
  } else if (activeTypoLayerId) {
    const layer = motionConfig.typography.layers.find(l => l.id === activeTypoLayerId);
    if (layer) {
      currentLayerScale = layer.transform.scale;
      currentLayerRotation = layer.transform.rotation;
    }
  } else if (activeGenerativeLayerId) {
    const layer = generativeLayers.find(l => l.id === activeGenerativeLayerId);
    if (layer) {
      currentLayerScale = layer.transform.scale;
      currentLayerRotation = layer.transform.rotation;
    }
  } else if (activeCompositionLayerId) {
    const layer = compositionLayers.find(l => l.id === activeCompositionLayerId);
    if (layer) {
      currentLayerScale = layer.transform.scale;
      currentLayerRotation = layer.transform.rotation;
    }
  }

  const handleScale = (scale: number) => {
    if (selectedLayerId && selectedLayer) {
      updateLayer(selectedLayerId, { transform: { ...selectedLayer.transform, scale } });
    } else {
      if (activeTypoLayerId) updateTypoLayerTransform(activeTypoLayerId, { scale });
      if (activeGenerativeLayerId) updateLayerTransform(activeGenerativeLayerId, { scale });
      if (activeCompositionLayerId) {
        const layer = useEditorStore.getState().compositionLayers.find(l => l.id === activeCompositionLayerId);
        if (layer) updateCompositionLayer(activeCompositionLayerId, { transform: { ...layer.transform, scale } });
      }
    }
  };

  const handleRotate = (rotation: number) => {
    if (selectedLayerId && selectedLayer) {
      updateLayer(selectedLayerId, { transform: { ...selectedLayer.transform, rotation } });
    } else {
      if (activeTypoLayerId) updateTypoLayerTransform(activeTypoLayerId, { rotation });
      if (activeGenerativeLayerId) updateLayerTransform(activeGenerativeLayerId, { rotation });
      if (activeCompositionLayerId) {
        const layer = useEditorStore.getState().compositionLayers.find(l => l.id === activeCompositionLayerId);
        if (layer) updateCompositionLayer(activeCompositionLayerId, { transform: { ...layer.transform, rotation } });
      }
    }
  };

  const handleResizeX = (width: number) => {
    if (selectedLayerId && selectedLayer) {
      updateLayer(selectedLayerId, { transform: { ...selectedLayer.transform, textBoxWidth: width } as any });
    } else {
      if (activeTypoLayerId) updateTypoLayerTransform(activeTypoLayerId, { textBoxWidth: width });
    }
  };

  const handleResizeY = (height: number) => {
    if (selectedLayerId && selectedLayer) {
      updateLayer(selectedLayerId, { transform: { ...selectedLayer.transform, textBoxHeight: height } as any });
    } else {
      if (activeTypoLayerId) updateTypoLayerTransform(activeTypoLayerId, { textBoxHeight: height });
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: rect ? 'block' : 'none',
        }}
      >
        <FloatingToolbar />
        <InteractiveGizmo
          active={true}
          elementRef={targetRef}
          currentScale={currentLayerScale}
          currentRotation={currentLayerRotation}
          currentWidth={rect?.width}
          currentHeight={rect?.height}
          onScale={handleScale}
          onRotate={handleRotate}
          onResizeX={handleResizeX}
          onResizeY={handleResizeY}
          showResizeX={!!activeTypoLayerId || (selectedLayer?.type === 'text')}
          showResizeY={!!activeTypoLayerId || (selectedLayer?.type === 'text')}
        />
      </div>
    </div>
  );
}
