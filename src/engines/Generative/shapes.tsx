
import type { GenerativeLayer } from '@/types/motion.types';

export function renderGenerativeShape(layer: GenerativeLayer, currentColor: string) {
  const { type, shapeProps } = layer;

  if (type === 'circle') {
    return (
      <circle 
        cx="50" 
        cy="50" 
        r={shapeProps?.radius || 40} 
        fill={currentColor} 
      />
    );
  }

  if (type === 'square') {
    const size = shapeProps?.size || 80;
    const rx = shapeProps?.radius || 10;
    return (
      <rect 
        x={50 - size / 2} 
        y={50 - size / 2} 
        width={size} 
        height={size} 
        rx={rx} 
        fill={currentColor} 
      />
    );
  }

  if (type === 'star') {
    const points = shapeProps?.points || 5;
    const innerRadius = shapeProps?.innerRadius || 20;
    const outerRadius = shapeProps?.outerRadius || 45;
    
    const pts = [];
    const angle = Math.PI / points;
    for (let i = 0; i < 2 * points; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const x = 50 + r * Math.sin(i * angle);
      const y = 50 - r * Math.cos(i * angle);
      pts.push(`${x},${y}`);
    }
    
    return (
      <polygon points={pts.join(' ')} fill={currentColor} />
    );
  }

  if (type === 'spirograph') {
    const R = shapeProps?.outerR || 30;
    const r = shapeProps?.innerR || 12;
    const d = shapeProps?.d || 25;
    const resolution = 300;
    
    let path = '';
    for (let i = 0; i <= resolution; i++) {
      const theta = (i / resolution) * Math.PI * 2 * (r / gcd(R, r));
      const x = 50 + (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
      const y = 50 + (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);
      if (i === 0) path += `M ${x} ${y} `;
      else path += `L ${x} ${y} `;
    }
    path += 'Z';
    return (
      <path d={path} fill="none" stroke={currentColor} strokeWidth={shapeProps?.strokeWidth || 2} />
    );
  }

  if (type === 'orbital') {
    const rings = shapeProps?.rings || 3;
    const baseRadius = shapeProps?.baseRadius || 15;
    const spacing = shapeProps?.spacing || 10;
    
    return (
      <g stroke={currentColor} strokeWidth={shapeProps?.strokeWidth || 2} fill="none">
        {Array.from({ length: rings }).map((_, i) => (
          <circle key={i} cx="50" cy="50" r={baseRadius + (i * spacing)} />
        ))}
      </g>
    );
  }

  if (type === 'hexagon') {
    const size = shapeProps?.size || 40;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = 50 + size * Math.cos(angle);
      const y = 50 + size * Math.sin(angle);
      pts.push(`${x},${y}`);
    }
    return (
      <polygon points={pts.join(' ')} fill={currentColor} />
    );
  }

  // Fallback
  return null;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
