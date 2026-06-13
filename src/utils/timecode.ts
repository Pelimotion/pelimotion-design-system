export function formatTimecode(seconds: number, fps: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * fps);

  const pad = (num: number, size: number = 2) => num.toString().padStart(size, '0');

  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}
