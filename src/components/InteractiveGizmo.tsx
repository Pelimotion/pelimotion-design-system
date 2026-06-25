import React from 'react';

export interface InteractiveGizmoProps {
  active: boolean;
  elementRef: React.RefObject<HTMLElement | null>;
  currentScale?: number;
  currentRotation?: number;
  currentX?: number;
  currentY?: number;
  currentWidth?: number;
  currentHeight?: number;
  onScale?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  onMove?: (x: number, y: number) => void;
  onResizeX?: (width: number) => void;
  onResizeY?: (height: number) => void;
  showResizeX?: boolean;
  showResizeY?: boolean;
}

export function InteractiveGizmo({
  active,
  elementRef,
  currentScale = 1,
  currentX = 0,
  currentY = 0,
  currentWidth,
  currentHeight,
  onScale,
  onRotate,
  onMove,
  onResizeX,
  onResizeY,
  showResizeX = false,
  showResizeY = false,
}: InteractiveGizmoProps) {
  if (!active) return null;

  // ─── Drag helpers ─────────────────────────────────────────────────────────
  // Prevent browser text-selection during all Gizmo drag operations.
  const startDrag = () => document.body.classList.add('dragging-active');
  const stopDrag  = () => document.body.classList.remove('dragging-active');

  // ─── Move (center drag) ───────────────────────────────────────────────────

  const handleMoveMouseDown = (e: React.MouseEvent) => {
    // Only trigger on the center area, not on handles
    if ((e.target as HTMLElement).closest('.gizmo-handle')) return;
    e.stopPropagation();
    e.preventDefault();

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = currentX;
    const startY = currentY;

    // Get the canvas scale factor so we convert screen pixels → canvas units
    const canvasEl = document.getElementById('canvas-fixed-resolution');
    const canvasBounds = canvasEl?.getBoundingClientRect();
    const canvasNativeW = canvasEl?.offsetWidth ?? 1;
    const scaleRatio = canvasBounds ? canvasBounds.width / canvasNativeW : 1;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const dx = (moveEvent.clientX - startMouseX) / scaleRatio;
      const dy = (moveEvent.clientY - startMouseY) / scaleRatio;
      if (onMove) onMove(startX + dx, startY + dy);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      stopDrag();
    };

    startDrag();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── Scale (corner drag) ─────────────────────────────────────────────────

  const handleScaleMouseDown = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = currentScale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let delta = 0;
      if (corner === 'bottom-right') delta = dx + dy;
      else if (corner === 'bottom-left') delta = -dx + dy;
      else if (corner === 'top-right') delta = dx - dy;
      else if (corner === 'top-left') delta = -dx - dy;

      const scaleDelta = (delta / 200) * startScale;
      const newScale = Math.max(0.1, startScale + scaleDelta);

      if (onScale) onScale(newScale);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      stopDrag();
    };

    startDrag();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── Rotate ───────────────────────────────────────────────────────────────

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const angleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let angleDeg = (angleRad * 180) / Math.PI + 90;

      if (moveEvent.shiftKey) {
        angleDeg = Math.round(angleDeg / 15) * 15;
      }

      if (onRotate) onRotate(angleDeg);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      stopDrag();
    };

    startDrag();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── Resize X ─────────────────────────────────────────────────────────────

  const handleResizeXMouseDown = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    let startWidth = currentWidth || 300;
    if (!currentWidth && elementRef.current) {
      startWidth = elementRef.current.getBoundingClientRect().width / currentScale;
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / currentScale;
      const delta = direction === 'right' ? dx : -dx;
      const newWidth = Math.max(50, startWidth + delta);
      if (onResizeX) onResizeX(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      stopDrag();
    };

    startDrag();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // ─── Resize Y ─────────────────────────────────────────────────────────────

  const handleResizeYMouseDown = (e: React.MouseEvent, direction: 'top' | 'bottom') => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    let startHeight = currentHeight || 100;
    if (!currentHeight && elementRef.current) {
      startHeight = elementRef.current.getBoundingClientRect().height / currentScale;
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dy = (moveEvent.clientY - startY) / currentScale;
      const delta = direction === 'bottom' ? dy : -dy;
      const newHeight = Math.max(20, startHeight + delta);
      if (onResizeY) onResizeY(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      stopDrag();
    };

    startDrag();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMoveMouseDown}
      style={{
        position: 'absolute',
        inset: -8,
        border: '1.5px dashed var(--color-accent)',
        borderRadius: 4,
        pointerEvents: 'auto',
        zIndex: 100,
        boxShadow: '0 0 12px hsla(191, 100%, 50%, 0.15)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'move',
      }}
    >
      {/* Corner handles for scale */}
      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(corner => {
        const [v, h] = corner.split('-');
        return (
          <div
            key={corner}
            onMouseDown={(e) => handleScaleMouseDown(e, corner)}
            className={`gizmo-handle scale-handle scale-handle-${corner}`}
            style={{
              position: 'absolute',
              width: 14, height: 14, borderRadius: '50%',
              background: 'var(--color-accent)',
              border: '2px solid var(--color-bg-primary)',
              [v as any]: -7, [h as any]: -7,
              cursor: `${corner.replace('-', '')}-resize` as any,
              pointerEvents: 'auto',
              boxShadow: '0 0 6px hsla(191, 100%, 50%, 0.3)',
              transform: 'scale(var(--inverse-scale, 1))',
            }}
          />
        );
      })}

      {/* Resize X handles */}
      {showResizeX && (['left', 'right'] as const).map(side => (
        <div
          key={side}
          onMouseDown={(e) => handleResizeXMouseDown(e, side)}
          className="gizmo-handle"
          style={{
            position: 'absolute',
            width: 8, height: 16, borderRadius: 4,
            background: 'var(--color-accent)',
            border: '1px solid rgba(0,0,0,0.3)',
            top: '50%', transform: 'translateY(-50%) scale(var(--inverse-scale, 1))',
            [side as any]: -6, cursor: 'ew-resize',
            pointerEvents: 'auto',
            boxShadow: '0 0 6px hsla(191, 100%, 50%, 0.3)',
          }}
        />
      ))}

      {/* Resize Y handles */}
      {showResizeY && (['top', 'bottom'] as const).map(side => (
        <div
          key={side}
          onMouseDown={(e) => handleResizeYMouseDown(e, side)}
          className="gizmo-handle"
          style={{
            position: 'absolute',
            width: 16, height: 8, borderRadius: 4,
            background: 'var(--color-accent)',
            border: '1px solid rgba(0,0,0,0.3)',
            left: '50%', transform: 'translateX(-50%) scale(var(--inverse-scale, 1))',
            [side as any]: -6, cursor: 'ns-resize',
            pointerEvents: 'auto',
            boxShadow: '0 0 6px hsla(191, 100%, 50%, 0.3)',
          }}
        />
      ))}

      {/* Rotation handle */}
      <div
        onMouseDown={handleRotateMouseDown}
        className="gizmo-handle rotate-handle"
        style={{
          position: 'absolute',
          top: -36,
          left: '50%',
          marginLeft: -7,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--color-success)',
          border: '2px solid var(--color-bg-primary)',
          cursor: 'crosshair',
          pointerEvents: 'auto',
          boxShadow: '0 0 6px hsla(157, 100%, 50%, 0.3)',
          transform: 'scale(var(--inverse-scale, 1))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1,
          height: 16,
          background: 'var(--color-accent)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
