import { createNoise2D } from 'simplex-noise';

// Seeded PRNG (Alea)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fbm2D(
  noise2D: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
  persistence: number
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxAmplitude = 0;

  for (let o = 0; o < octaves; o++) {
    value += noise2D(x * frequency, y * frequency) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return value / maxAmplitude;
}

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let isRunning = false;
let config: any = {};
let prng: any = null;
let noise2D: any = null;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    canvas = payload.canvas;
    ctx = canvas?.getContext('2d') || null;
    config = payload.config;
    prng = mulberry32(config.seed || 1234);
    noise2D = createNoise2D(prng);
  } else if (type === 'START') {
    isRunning = true;
    requestAnimationFrame(renderLoop);
  } else if (type === 'STOP') {
    isRunning = false;
  } else if (type === 'UPDATE_CONFIG') {
    config = { ...config, ...payload };
  }
};

function renderLoop(time: number) {
  if (!isRunning || !ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { amplitude = 1, frequency = 1, octaves = 1, persistence = 0.5 } = config;
  
  // Example: Draw something using noise
  const nx = fbm2D(noise2D, time * 0.001 * frequency, 0, octaves, persistence);
  const ny = fbm2D(noise2D, 0, time * 0.001 * frequency, octaves, persistence);

  // Apply tritonal filters (simulate with globalCompositeOperation and colors)
  ctx.save();
  ctx.translate(canvas.width / 2 + nx * amplitude * 50, canvas.height / 2 + ny * amplitude * 50);
  
  // Draw an organic blob
  ctx.beginPath();
  ctx.arc(0, 0, 80 + nx * 20, 0, Math.PI * 2);
  ctx.fillStyle = config.colors ? config.colors[0] : '#a78bfa';
  ctx.fill();
  
  ctx.restore();

  // Chromatic Aberration Simulation
  if (config.tritone) {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + nx * amplitude * 52, canvas.height / 2 + ny * amplitude * 48, 80 + nx * 20, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(renderLoop);
}
