
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

  if (type === 'mesh') {
    const nodes = shapeProps?.nodes || 12;
    const connections = shapeProps?.connections || 20;
    const radius = shapeProps?.radius || 35;
    const pts: {x: number; y: number}[] = [];
    
    // Seeded random for consistent mesh generation
    const seededRandom = (seed: number) => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < nodes; i++) {
      const angle = seededRandom(i * 10) * Math.PI * 2;
      const r = seededRandom(i * 20) * radius;
      pts.push({ x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) });
    }

    const lines = [];
    for (let i = 0; i < connections; i++) {
      const a = Math.floor(seededRandom(i * 30 + 1) * nodes);
      const b = Math.floor(seededRandom(i * 40 + 2) * nodes);
      if (a !== b) lines.push({ a, b });
    }

    return (
      <g stroke={currentColor} strokeWidth={shapeProps?.strokeWidth || 0.5} fill="none">
        {lines.map((l, i) => (
          <line key={`l-${i}`} x1={pts[l.a]!.x} y1={pts[l.a]!.y} x2={pts[l.b]!.x} y2={pts[l.b]!.y} opacity={0.6} />
        ))}
        {pts.map((p, i) => (
          <circle key={`n-${i}`} cx={p.x} cy={p.y} r={1.5} fill={currentColor} stroke="none" />
        ))}
      </g>
    );
  }

  if (type === 'concentric') {
    const layers = shapeProps?.layers || 6;
    const baseRadius = shapeProps?.baseRadius || 5;
    const spacing = shapeProps?.spacing || 6;
    const sides = shapeProps?.sides || 4; // 0 for circle, 3+ for polygons
    
    return (
      <g stroke={currentColor} strokeWidth={shapeProps?.strokeWidth || 1.5} fill="none">
        {Array.from({ length: layers }).map((_, i) => {
          const r = baseRadius + (i * spacing);
          if (sides < 3) {
            return <circle key={i} cx="50" cy="50" r={r} />;
          } else {
            const pts = [];
            for (let j = 0; j < sides; j++) {
              const angle = (Math.PI * 2 / sides) * j - Math.PI / 2 + (i * 0.1); // slight rotation per layer
              pts.push(`${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`);
            }
            return <polygon key={i} points={pts.join(' ')} />;
          }
        })}
      </g>
    );
  }

  if (type === 'fluid') {
    const size = shapeProps?.size || 40;
    const complexity = shapeProps?.complexity || 6;
    
    // Seeded random
    const seededRandom = (seed: number) => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const pts: {x: number; y: number}[] = [];
    for (let i = 0; i < complexity; i++) {
      const angle = (Math.PI * 2 / complexity) * i;
      // random radius fluctuation
      const r = size * (0.8 + 0.4 * seededRandom(i * 15));
      pts.push({
        x: 50 + r * Math.cos(angle),
        y: 50 + r * Math.sin(angle),
      });
    }

    // Create a smooth bezier path through points
    let path = `M ${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 0; i < complexity; i++) {
      const p1 = pts[i]!;
      const p2 = pts[(i + 1) % complexity]!;
      // simplified smoothing
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;
      path += ` Q ${p1.x} ${p1.y} ${cx} ${cy}`;
    }
    // close smoothly
    path += ` Q ${pts[0]!.x} ${pts[0]!.y} ${pts[0]!.x} ${pts[0]!.y} Z`;

    return (
      <path d={path} fill={currentColor} />
    );
  }

  if (type === 'particles') {
    const count = shapeProps?.count || 40;
    const dispersion = shapeProps?.dispersion || 30;
    
    const seededRandom = (seed: number) => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    return (
      <g fill={currentColor}>
        {Array.from({ length: count }).map((_, i) => {
          const angle = seededRandom(i * 10) * Math.PI * 2;
          const r = Math.pow(seededRandom(i * 20), 0.5) * dispersion; // uniform disc distribution
          const pSize = 0.5 + seededRandom(i * 30) * 2;
          return (
            <circle key={i} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r={pSize} opacity={0.3 + 0.7 * seededRandom(i * 40)} />
          );
        })}
      </g>
    );
  }

  if (type === 'grid') {
    const size = shapeProps?.size || 60;
    const columns = shapeProps?.columns || 3;
    const rows = shapeProps?.rows || 3;
    const gap = shapeProps?.gap || 10;
    const radius = shapeProps?.radius || 2;
    const itemWidth = (size - gap * (columns - 1)) / columns;
    const itemHeight = (size - gap * (rows - 1)) / rows;
    
    const elements = [];
    for(let i=0; i<columns; i++) {
      for(let j=0; j<rows; j++) {
        const x = 50 - size/2 + i * (itemWidth + gap);
        const y = 50 - size/2 + j * (itemHeight + gap);
        elements.push(<rect key={`${i}-${j}`} x={x} y={y} width={itemWidth} height={itemHeight} rx={radius} fill={currentColor} />);
      }
    }
    return <g>{elements}</g>;
  }

  if (type === 'wave') {
    const width = shapeProps?.width || 80;
    const amplitude = shapeProps?.amplitude || 15;
    const frequency = shapeProps?.frequency || 2;
    const strokeWidth = shapeProps?.strokeWidth || 3;
    const points = 100;
    let path = '';
    
    for (let i = 0; i <= points; i++) {
      const x = 50 - width/2 + (i / points) * width;
      const t = (i / points) * Math.PI * 2 * frequency;
      const y = 50 + Math.sin(t) * amplitude;
      if (i === 0) path += `M ${x} ${y} `;
      else path += `L ${x} ${y} `;
    }
    
    return (
      <path d={path} fill="none" stroke={currentColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    );
  }

  if (type === 'moire') {
    const lines = shapeProps?.lines || 40;
    const offsetAngle = shapeProps?.offsetAngle || 5;
    
    const renderLines = () => {
      const paths = [];
      const step = 100 / lines;
      for (let i = 0; i <= lines; i++) {
        paths.push(`M 0 ${i * step} L 100 ${i * step}`);
      }
      return paths.join(' ');
    };

    return (
      <g stroke={currentColor} strokeWidth={shapeProps?.strokeWidth || 0.5}>
        {/* Layer 1 - straight */}
        <path d={renderLines()} fill="none" />
        {/* Layer 2 - rotated */}
        <g transform={`rotate(${offsetAngle} 50 50)`}>
          <path d={renderLines()} fill="none" />
        </g>
      </g>
    );
  }

  // Fallback
  return null;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
