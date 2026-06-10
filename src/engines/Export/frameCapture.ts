/**
 * Frame Capture Utility
 * 
 * Uses html-to-image to snapshot a DOM element (the Preview Canvas)
 * and returns it as a PNG Blob. Optimized for frame-by-frame extraction.
 */
import { toBlob } from 'html-to-image'

export interface CaptureOptions {
  width: number;
  height: number;
}

export async function captureFrame(element: HTMLElement, options: CaptureOptions): Promise<Blob> {
  const blob = await toBlob(element, {
    width: options.width,
    height: options.height,
    canvasWidth: options.width,
    canvasHeight: options.height,
    pixelRatio: 1, // Force 1:1 pixel mapping, regardless of retina screens
    skipAutoScale: true,
    style: {
      // Force element to render at target resolution for the capture
      transform: 'none',
      width: `${options.width}px`,
      height: `${options.height}px`,
    },
    // We want transparent PNGs for compositing
    backgroundColor: 'rgba(0,0,0,0)',
  })

  if (!blob) {
    throw new Error('html-to-image returned null blob')
  }

  return blob
}
