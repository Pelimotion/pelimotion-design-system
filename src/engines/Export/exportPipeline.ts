/**
 * Export Pipeline — Phase 5
 * 
 * Orchestrates the rendering pipeline:
 * 1. Pauses normal GSAP playback
 * 2. Seeks the global timeline frame-by-frame
 * 3. Captures the DOM as a PNG Blob
 * 4. Adds to a ZIP archive in-memory using fflate
 * 5. Triggers download of the ZIP
 */
import { gsap } from 'gsap'
import { zip } from 'fflate'
import { captureFrame } from './frameCapture'
import { downloadFile } from '@/lib/downloadHandler'
import type { ExportConfig, ExportState } from '@/types/motion.types'

export async function runExportPipeline(
  element: HTMLElement,
  config: ExportConfig,
  onProgress: (state: Partial<ExportState>) => void
) {
  try {
    const { resolution, fps, duration } = config
    const [wStr, hStr] = (resolution || "1920x1080").split('x') as [string, string]
    const width = parseInt(wStr, 10)
    const height = parseInt(hStr, 10)

    const totalFrames = Math.floor(duration * fps)
    const frameInterval = 1 / fps

    onProgress({
      isExporting: true,
      stage: 'capturing',
      progress: 0,
      totalFrames,
      currentFrame: 0,
      errorMessage: undefined,
    })

    // Prepare ZIP payload object for fflate
    // Keys are filenames, values are Uint8Arrays
    const zipPayload: Record<string, Uint8Array | [Uint8Array, { level: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }]> = {}

    // Freeze global time
    gsap.globalTimeline.pause()
    // Seek to 0 to ensure clean start
    gsap.globalTimeline.seek(0)

    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame * frameInterval
      
      // Advance GSAP strictly to this frame's time
      gsap.globalTimeline.seek(time)

      // Wait a tiny bit for the DOM to flush styles/layout
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      // Capture the frame
      const blob = await captureFrame(element, { width, height })
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Format frame number with leading zeros (e.g. frame_0001.png)
      const frameName = `frame_${String(frame).padStart(4, '0')}.png`
      
      // Add to ZIP payload (no compression level for PNGs as they are already compressed)
      zipPayload[frameName] = [uint8Array, { level: 0 }]

      onProgress({
        currentFrame: frame + 1,
        progress: ((frame + 1) / totalFrames) * 100,
      })
    }

    onProgress({ stage: 'encoding', progress: 100 })

    // Generate ZIP in-memory
    const zipBuffer = await new Promise<Uint8Array>((resolve, reject) => {
      zip(zipPayload, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    // Trigger Download
    const blob = new Blob([zipBuffer as any], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    downloadFile(url, `aura_export_${resolution}_${fps}fps.zip`)

    // Cleanup
    URL.revokeObjectURL(url)

    // Restore playback
    gsap.globalTimeline.play()

    onProgress({ stage: 'complete', isExporting: false })
  } catch (error: any) {
    console.error('Export failed:', error)
    gsap.globalTimeline.play()
    onProgress({ 
      stage: 'error', 
      isExporting: false, 
      errorMessage: error.message || 'Unknown export error' 
    })
  }
}
