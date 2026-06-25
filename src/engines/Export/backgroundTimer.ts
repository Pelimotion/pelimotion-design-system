/**
 * Background Timer Utility
 * 
 * Provides a background-safe delay function using a Web Worker.
 * When a tab is hidden/minimized, the browser throttles main-thread
 * timers (setTimeout, requestAnimationFrame) to 1s or pauses them entirely.
 * Web Worker timers continue firing at high frequency, allowing our main-thread
 * render loop to process next frames without throttling via postMessage events.
 */

let timerWorker: Worker | null = null;
let delayId = 0;
const pendingDelays = new Map<number, () => void>();

function getTimerWorker(): Worker {
  if (timerWorker) return timerWorker;

  const code = `
    self.onmessage = (e) => {
      if (e.data.type === 'DELAY') {
        setTimeout(() => {
          self.postMessage({ type: 'DONE', id: e.data.id });
        }, e.data.ms);
      }
    };
  `;
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  timerWorker = new Worker(url);
  URL.revokeObjectURL(url);

  timerWorker.onmessage = (e) => {
    if (e.data.type === 'DONE') {
      const resolve = pendingDelays.get(e.data.id);
      if (resolve) {
        pendingDelays.delete(e.data.id);
        resolve();
      }
    }
  };

  return timerWorker;
}

export function backgroundDelay(ms: number): Promise<void> {
  // If document is visible, we can just use normal setTimeout for efficiency,
  // but if the document is hidden/backgrounded, we MUST use the worker to bypass throttling.
  // Actually, always using the worker is extremely safe and consistent.
  const worker = getTimerWorker();
  const id = delayId++;
  return new Promise((resolve) => {
    pendingDelays.set(id, resolve);
    worker.postMessage({ type: 'DELAY', ms, id });
  });
}
