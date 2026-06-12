import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

type AspectRatio = 'none' | '16:9' | '9:16' | '1:1' | '4:5';

interface RatioDef {
  label: string;
  w: number;
  h: number;
  color: string;
  description: string;
}

const RATIOS: Record<Exclude<AspectRatio, 'none'>, RatioDef> = {
  '16:9': { label: '16:9', w: 16, h: 9, color: '#22d3ee', description: 'Landscape / YouTube' },
  '9:16': { label: '9:16', w: 9, h: 16, color: '#a78bfa', description: 'Portrait / Stories / Reels' },
  '1:1': { label: '1:1', w: 1, h: 1, color: '#34d399', description: 'Square / Instagram' },
  '4:5': { label: '4:5', w: 4, h: 5, color: '#fb923c', description: 'Portrait / Instagram Feed' },
};

/**
 * CanvasGuides — Aspect Ratio Safe Zone Overlay
 *
 * Renders a non-interactive overlay showing the safe zone for the active
 * aspect ratio. Computed live from the canvas bounds on every frame.
 * Industry standard: used in Premiere, DaVinci Resolve, After Effects.
 */
export function CanvasGuides() {
  const { activeAspectRatio } = useEditorStore();
  const svgRef = useRef<SVGSVGElement>(null);

  const renderGuides = useCallback(() => {
    if (!svgRef.current || activeAspectRatio === 'none') {
      if (svgRef.current) {
        // Clear guides
        while (svgRef.current.firstChild) svgRef.current.removeChild(svgRef.current.firstChild);
      }
      return;
    }

    const svg = svgRef.current;
    const parent = svg.parentElement;
    if (!parent) return;

    const W = parent.clientWidth;
    const H = parent.clientHeight;

    // Calculate safe zone box that fits the ratio inside the canvas
    const ratioDef = RATIOS[activeAspectRatio as Exclude<AspectRatio, 'none'>];
    const { w: rw, h: rh, color, label, description } = ratioDef;

    // Fit: keep entire box visible inside canvas
    let boxW = W;
    let boxH = (W / rw) * rh;
    if (boxH > H) {
      boxH = H;
      boxW = (H / rh) * rw;
    }

    const boxX = (W - boxW) / 2;
    const boxY = (H - boxH) / 2;

    // Update SVG viewBox
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', `${W}`);
    svg.setAttribute('height', `${H}`);

    // Build SVG content using innerHTML for perf (avoids React diffing)
    const dimmerOpacity = 0.55;
    const borderWidth = 1.5;

    svg.innerHTML = `
      <defs>
        <clipPath id="safe-zone-clip">
          <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" />
        </clipPath>
        <filter id="guide-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Dimmer: outside safe zone -->
      <rect x="0" y="0" width="${W}" height="${boxY}" fill="rgba(0,0,0,${dimmerOpacity})" />
      <rect x="0" y="${boxY + boxH}" width="${W}" height="${H - boxY - boxH}" fill="rgba(0,0,0,${dimmerOpacity})" />
      <rect x="0" y="${boxY}" width="${boxX}" height="${boxH}" fill="rgba(0,0,0,${dimmerOpacity})" />
      <rect x="${boxX + boxW}" y="${boxY}" width="${W - boxX - boxW}" height="${boxH}" fill="rgba(0,0,0,${dimmerOpacity})" />

      <!-- Rule-of-thirds grid inside safe zone -->
      <line x1="${boxX + boxW / 3}" y1="${boxY}" x2="${boxX + boxW / 3}" y2="${boxY + boxH}"
            stroke="${color}" stroke-width="0.5" stroke-dasharray="4,6" opacity="0.25" />
      <line x1="${boxX + (boxW * 2) / 3}" y1="${boxY}" x2="${boxX + (boxW * 2) / 3}" y2="${boxY + boxH}"
            stroke="${color}" stroke-width="0.5" stroke-dasharray="4,6" opacity="0.25" />
      <line x1="${boxX}" y1="${boxY + boxH / 3}" x2="${boxX + boxW}" y2="${boxY + boxH / 3}"
            stroke="${color}" stroke-width="0.5" stroke-dasharray="4,6" opacity="0.25" />
      <line x1="${boxX}" y1="${boxY + (boxH * 2) / 3}" x2="${boxX + boxW}" y2="${boxY + (boxH * 2) / 3}"
            stroke="${color}" stroke-width="0.5" stroke-dasharray="4,6" opacity="0.25" />

      <!-- Safe zone border -->
      <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}"
            fill="none" stroke="${color}" stroke-width="${borderWidth}" opacity="0.9" />

      <!-- Corner accents -->
      ${['tl','tr','bl','br'].map(c => {
        const cx = c.includes('l') ? boxX : boxX + boxW;
        const cy = c.includes('t') ? boxY : boxY + boxH;
        const dx = c.includes('l') ? 1 : -1;
        const dy = c.includes('t') ? 1 : -1;
        const len = Math.min(boxW, boxH) * 0.07;
        return `
          <line x1="${cx}" y1="${cy}" x2="${cx + dx * len}" y2="${cy}"
                stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="1" />
          <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + dy * len}"
                stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="1" />
        `;
      }).join('')}

      <!-- Label pill (top-left corner of safe zone) -->
      <rect x="${boxX + 8}" y="${boxY + 8}" width="68" height="22" rx="4"
            fill="${color}" opacity="0.9" />
      <text x="${boxX + 14}" y="${boxY + 23}" font-family="'SF Mono', 'Fira Code', monospace"
            font-size="11" font-weight="600" fill="#000" letter-spacing="0.05em">${label}</text>

      <!-- Description label (top-right) -->
      <rect x="${boxX + boxW - 150}" y="${boxY + 8}" width="142" height="22" rx="4"
            fill="rgba(0,0,0,0.5)" />
      <text x="${boxX + boxW - 144}" y="${boxY + 23}" font-family="'Inter', sans-serif"
            font-size="10" fill="${color}" opacity="0.9">${description}</text>

      <!-- Center crosshair -->
      <line x1="${boxX + boxW / 2 - 8}" y1="${boxY + boxH / 2}" x2="${boxX + boxW / 2 + 8}" y2="${boxY + boxH / 2}"
            stroke="${color}" stroke-width="1" opacity="0.4" />
      <line x1="${boxX + boxW / 2}" y1="${boxY + boxH / 2 - 8}" x2="${boxX + boxW / 2}" y2="${boxY + boxH / 2 + 8}"
            stroke="${color}" stroke-width="1" opacity="0.4" />
    `;
  }, [activeAspectRatio]);

  useEffect(() => {
    // Use rAF loop so guides re-render if canvas resizes
    let rafId: number;
    const loop = () => {
      renderGuides();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [renderGuides]);

  if (activeAspectRatio === 'none') return null;

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50, // Above content, below Gizmo (9999)
        overflow: 'visible',
      }}
      aria-hidden="true"
    />
  );
}

// Export the ratio definitions for use in the toolbar
export { RATIOS };
export type { AspectRatio, RatioDef };
