import React from 'react';

export interface InteractiveGizmoProps {
  active: boolean;
  elementRef: React.RefObject<HTMLElement | null>;
  currentScale?: number;
  currentRotation?: number;
  currentWidth?: number;
  currentHeight?: number;
  onScale?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  onResizeX?: (width: number) => void;
  onResizeY?: (height: number) => void;
  showResizeX?: boolean;
  showResizeY?: boolean;
}

export function InteractiveGizmo({
  active,
  elementRef,
  currentScale = 1,
  currentWidth,
  currentHeight,
  onScale,
  onRotate,
  onResizeX,
  onResizeY,
  showResizeX = false,
  showResizeY = false,
}: InteractiveGizmoProps) {
  if (!active) return null;

  const handleScaleMouseDown = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = currentScale;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Basic delta from start point. Moving right/down increases scale.
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Determine direction based on corner
      let delta = 0;
      if (corner === 'bottom-right') delta = dx + dy;
      else if (corner === 'bottom-left') delta = -dx + dy;
      else if (corner === 'top-right') delta = dx - dy;
      else if (corner === 'top-left') delta = -dx - dy;

      const scaleDelta = (delta / 200) * startScale;
      let newScale = Math.max(0.1, startScale + scaleDelta);
      
      if (onScale) onScale(newScale);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeXMouseDown = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    // Get actual width if currentWidth is undefined or 0
    let startWidth = currentWidth || 300;
    if (!currentWidth && elementRef.current) {
      startWidth = elementRef.current.getBoundingClientRect().width / currentScale;
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / currentScale;
      const delta = direction === 'right' ? dx : -dx;
      let newWidth = startWidth + delta;
      
      newWidth = Math.max(50, newWidth);
      if (onResizeX) onResizeX(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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
      let newHeight = startHeight + delta;
      
      newHeight = Math.max(20, newHeight);
      if (onResizeY) onResizeY(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: -8,
        border: '1.5px dashed var(--color-accent)',
        borderRadius: 4,
        pointerEvents: 'none',
        zIndex: 100,
        boxShadow: '0 0 12px hsla(191, 100%, 50%, 0.15)',
        userSelect: 'none', // user-select: none
      }}
    >
      {/* Corner handles for scale */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => {
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
      {showResizeX && ['left', 'right'].map(side => (
        <div
          key={side}
          onMouseDown={(e) => handleResizeXMouseDown(e, side as 'left'|'right')}
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
      {showResizeY && ['top', 'bottom'].map(side => (
        <div
          key={side}
          onMouseDown={(e) => handleResizeYMouseDown(e, side as 'top'|'bottom')}
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
