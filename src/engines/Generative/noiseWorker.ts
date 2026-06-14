import { createNoise2D, createNoise3D } from 'simplex-noise';

// Seeded PRNG
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

function getPosterizedTime(elapsed: number, fps: number | undefined): number {
  if (!fps) return elapsed;
  return Math.floor(elapsed * fps) / fps;
}

let noise2D: any;
let noise3D: any;
let lastSeed: number | null = null;

self.onmessage = (e) => {
  const { type, payload } = e.data;
  if (type === 'CALCULATE') {
    const { elapsed, targetsCount, config } = payload;
    const {
      amplitude, frequency, octaves, persistence, noiseType, seed,
      channels, propertyFps, propertyAmplitudes = {}, propertyFrequencies = {}
    } = config;

    if (lastSeed !== seed) {
      const prng = mulberry32(seed);
      noise2D = createNoise2D(prng);
      const prng3D = mulberry32(seed + 999);
      noise3D = createNoise3D(prng3D);
      lastSeed = seed;
    }

    const results = [];
    for (let i = 0; i < targetsCount; i++) {
      const offsetX = i * 3.7;
      const offsetY = i * 2.3;
      const props: any = {};

      if (channels.includes('x')) {
        const t = getPosterizedTime(elapsed, propertyFps?.x);
        const f = frequency * (propertyFrequencies.x ?? 1);
        const a = amplitude * (propertyAmplitudes.x ?? 1);
        const nx = noiseType === 'simplex2D'
          ? fbm2D(noise2D, t * f + offsetX, 0, octaves, persistence)
          : fbm2D((x, y) => noise3D(x, y, offsetY), t * f + offsetX, 0, octaves, persistence);
        props.x = nx * a;
      }

      if (channels.includes('y')) {
        const t = getPosterizedTime(elapsed, propertyFps?.y);
        const f = frequency * (propertyFrequencies.y ?? 1);
        const a = amplitude * (propertyAmplitudes.y ?? 1);
        const ny = noiseType === 'simplex2D'
          ? fbm2D(noise2D, 0, t * f + offsetY, octaves, persistence)
          : fbm2D((x, y) => noise3D(x, offsetX, y), 0, t * f + offsetY, octaves, persistence);
        props.y = ny * a * 0.6;
      }

      if (channels.includes('rotation')) {
        const t = getPosterizedTime(elapsed, propertyFps?.rotation);
        const f = frequency * (propertyFrequencies.rotation ?? 1);
        const a = amplitude * (propertyAmplitudes.rotation ?? 1);
        const nr = fbm2D(noise2D, t * f * 0.5 + offsetX + 10, offsetY + 5, octaves, persistence);
        props.rotation = nr * a * 0.8;
      }

      if (channels.includes('scale')) {
        const t = getPosterizedTime(elapsed, propertyFps?.scale);
        const f = frequency * (propertyFrequencies.scale ?? 1);
        const a = amplitude * (propertyAmplitudes.scale ?? 1);
        const ns = fbm2D(noise2D, offsetX + 20, t * f * 0.3 + offsetY + 7, octaves, persistence);
        props.scale = 1 + ns * 0.12 * (a / 20);
      }
      
      if (channels.includes('scaleX')) {
        const t = getPosterizedTime(elapsed, propertyFps?.scaleX);
        const f = frequency * (propertyFrequencies.scaleX ?? 1);
        const a = amplitude * (propertyAmplitudes.scaleX ?? 1);
        const nsX = fbm2D(noise2D, offsetX + 25, t * f * 0.3 + offsetY + 11, octaves, persistence);
        props.scaleX = 1 + nsX * 0.12 * (a / 20);
      }
      
      if (channels.includes('scaleY')) {
        const t = getPosterizedTime(elapsed, propertyFps?.scaleY);
        const f = frequency * (propertyFrequencies.scaleY ?? 1);
        const a = amplitude * (propertyAmplitudes.scaleY ?? 1);
        const nsY = fbm2D(noise2D, offsetX + 30, t * f * 0.3 + offsetY + 14, octaves, persistence);
        props.scaleY = 1 + nsY * 0.12 * (a / 20);
      }
      
      if (channels.includes('skew')) {
        const t = getPosterizedTime(elapsed, propertyFps?.skew);
        const f = frequency * (propertyFrequencies.skew ?? 1);
        const a = amplitude * (propertyAmplitudes.skew ?? 1);
        const nSk = fbm2D(noise2D, offsetX + 35, t * f * 0.4 + offsetY + 18, octaves, persistence);
        props.skewX = nSk * a * 0.5;
        props.skewY = nSk * a * 0.2;
      }

      if (channels.includes('opacity')) {
        const t = getPosterizedTime(elapsed, propertyFps?.opacity);
        const f = frequency * (propertyFrequencies.opacity ?? 1);
        const a = propertyAmplitudes.opacity ?? 1;
        const no = fbm2D(noise2D, t * f * 0.2 + offsetX + 50, offsetY + 30, octaves, persistence);
        props.opacity = 0.5 + no * 0.5 * 0.8 * a;
      }

      results.push(props);
    }

    self.postMessage({ type: 'RESULT', values: results });
  }
};
