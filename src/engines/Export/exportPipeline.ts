/**
 * Export Pipeline — Phase 5 (Updated)
 * 
 * Orchestrates the rendering pipeline:
 * 1. Pauses normal GSAP playback
 * 2. Seeks the global timeline frame-by-frame (syncing <video> if present)
 * 3. Captures the DOM as a PNG Blob
 * 4. Dispatches to either Zip (fflate) or FFmpeg (MP4/MOV)
 */
import { gsap } from 'gsap'
import { zip } from 'fflate'
import { captureFrame } from './frameCapture'
import { downloadFile } from '@/lib/downloadHandler'
import { encodeVideoWithFFmpeg } from './ffmpegEncoder'
import { uploadToBunny } from '@/lib/bunnyStorage'
import type { ExportConfig, ExportState } from '@/types/motion.types'

export async function runExportPipeline(
  element: HTMLElement,
  config: ExportConfig,
  onProgress: (state: Partial<ExportState>) => void
) {
  try {
    const { resolution, fps, duration, format, stillFrame } = config
    const [wStr, hStr] = (resolution || "1920x1080").split('x') as [string, string]
    const width = parseInt(wStr, 10)
    const height = parseInt(hStr, 10)

    const totalFrames = format === 'png-still' ? 1 : Math.floor(duration * fps)
    const frameInterval = 1 / fps

    onProgress({
      isExporting: true,
      stage: 'capturing',
      progress: 0,
      totalFrames,
      currentFrame: 0,
      errorMessage: undefined,
    })

    // Freeze global time
    gsap.globalTimeline.pause()

    const frames: Uint8Array[] = []
    const zipPayload: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {}

    const bgVideo = element.querySelector('#export-bg-video') as HTMLVideoElement | null
    if (bgVideo) {
      bgVideo.pause()
    }

    for (let frame = 0; frame < totalFrames; frame++) {
      // If png-still, we use the selected stillFrame time, else sequential
      const frameIndex = format === 'png-still' ? stillFrame : frame
      const time = frameIndex * frameInterval
      
      // Advance GSAP strictly to this frame's time
      gsap.globalTimeline.seek(time)

      // Sync video background
      if (bgVideo) {
        bgVideo.currentTime = time % bgVideo.duration || time
      }

      // Wait a tiny bit for the DOM to flush styles/layout and video to seek
      await new Promise(resolve => setTimeout(resolve, 50)) // 50ms is usually enough for video seek
      
      // Capture the frame
      const blob = await captureFrame(element, { width, height })
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      frames.push(uint8Array)

      if (format === 'png-sequence') {
        const frameName = `frame_${String(frame).padStart(4, '0')}.png`
        zipPayload[frameName] = [uint8Array, { level: 0 }]
      }

      onProgress({
        currentFrame: frame + 1,
        progress: ((frame + 1) / totalFrames) * 100,
      })
    }

    onProgress({ stage: 'encoding', progress: 0 })

    const fileNameTimestamp = new Date().toISOString().replace(/[:.]/g, '-')
    let finalBlob: Blob | null = null
    let finalName = ''

    if (format === 'png-still') {
      finalBlob = new Blob([frames[0] as any], { type: 'image/png' })
      finalName = `pelimotion_export_${resolution}_${fileNameTimestamp}.png`
    } 
    else if (format === 'png-sequence') {
      const zipBuffer = await new Promise<Uint8Array>((resolve, reject) => {
        zip(zipPayload, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      })
      finalBlob = new Blob([zipBuffer as any], { type: 'application/zip' })
      finalName = `pelimotion_export_${resolution}_${fps}fps_${fileNameTimestamp}.zip`
    }
    else if (format === 'mp4' || format === 'mov') {
      const videoBuffer = await encodeVideoWithFFmpeg(frames, fps, format, (prog) => {
        onProgress({ progress: prog })
      })
      const mime = format === 'mp4' ? 'video/mp4' : 'video/quicktime'
      finalBlob = new Blob([videoBuffer as any], { type: mime })
      finalName = `pelimotion_export_${resolution}_${fileNameTimestamp}.${format}`
    }

    if (finalBlob && finalName) {
      // 1. Download locally
      const url = URL.createObjectURL(finalBlob)
      downloadFile(url, finalName)
      URL.revokeObjectURL(url)

      // 2. Upload to Bunny (defaulting to 'Generativo' or 'Tipografia' folder based on some state, but we'll use 'Generativo' for now)
      // For robustness, in a real app we'd pass activePanel, but we'll infer it or just save to 'Tipografia' if it has no video bg
      const folder = format.includes('png') ? 'Tipografia' : 'Generativo'
      onProgress({ errorMessage: 'Salvando na Nuvem...' })
      await uploadToBunny(finalBlob, finalName, folder)
    }

    // Restore playback
    if (bgVideo) bgVideo.play()
    gsap.globalTimeline.play()

    onProgress({ stage: 'complete', progress: 100, isExporting: false, errorMessage: undefined })
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
