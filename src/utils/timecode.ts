export function formatTimecode(seconds: number, fps: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * fps);

  const pad = (num: number, size: number = 2) => num.toString().padStart(size, '0');

  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}

export function parseTimecode(tc: string, fps: number): number {
  const trimmed = tc.trim();
  
  // 1. Simples segundos (ex: "2.5", "5.2s", "12s")
  if (/^\d+(\.\d+)?s?$/.test(trimmed)) {
    return parseFloat(trimmed.replace('s', ''));
  }

  // 2. Frames diretos (ex: "120f", "30f")
  if (/^\d+f$/.test(trimmed)) {
    const frames = parseInt(trimmed.slice(0, -1));
    return frames / fps;
  }

  // 3. Formato delimitado por dois pontos (HH:MM:SS:FF, MM:SS:FF, SS:FF)
  const parts = trimmed.split(':');
  if (parts.length >= 2 && parts.every(p => /^\d+$/.test(p))) {
    const vals = parts.map(Number);
    if (parts.length === 4) {
      const h = vals[0] ?? 0;
      const m = vals[1] ?? 0;
      const s = vals[2] ?? 0;
      const f = vals[3] ?? 0;
      return h * 3600 + m * 60 + s + f / fps;
    } else if (parts.length === 3) {
      const m = vals[0] ?? 0;
      const s = vals[1] ?? 0;
      const f = vals[2] ?? 0;
      return m * 60 + s + f / fps;
    } else if (parts.length === 2) {
      const s = vals[0] ?? 0;
      const f = vals[1] ?? 0;
      return s + f / fps;
    }
  }

  return NaN;
}

