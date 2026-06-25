/**
 * Export Pipeline — Phase 5 (Updated for WebCodecs v2)
 * 
 * Orchestrates the rendering pipeline:
 * 1. Pauses normal GSAP playback
 * 2. Seeks the global timeline frame-by-frame (syncing <video> if present)
 * 3. Captures the DOM as a PNG Blob
 * 4. Dispatches to either Zip (fflate), FFmpeg.wasm, or WebCodecs + Mediabunny
 */
import { gsap } from 'gsap'
import { zip } from 'fflate'
import { captureFrame } from './frameCapture'
import { downloadFile } from '@/lib/downloadHandler'
import { encodeVideoWithFFmpeg, muxVideoAndAudioWithFFmpeg } from './ffmpegEncoder'
import { mixAudioTracksToWav } from '@/lib/audioMixer'
import type { ExportConfig, ExportState } from '@/types/motion.types'
import { useEditorStore } from '@/store/useEditorStore'
import type { ExportWorkerConfig } from './exportWorker'
import { Telemetry } from '@/lib/telemetry'
import ExportWorker from './exportWorker?worker'
import { backgroundDelay } from './backgroundTimer'

function sendAndWait(worker: Worker, message: any, expectedResponseType: string, timeoutMs = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const cleanup = () => {
      worker.removeEventListener('message', handler);
      if (timer) clearTimeout(timer);
    };
    const handler = (e: MessageEvent) => {
      if (e.data.type === expectedResponseType) {
        cleanup();
        resolve(e.data);
      } else if (e.data.type === 'ERROR') {
        cleanup();
        reject(new Error(e.data.message));
      }
    };
    worker.addEventListener('message', handler);
    worker.postMessage(message);
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Worker INIT timed out after ${timeoutMs}ms — falling back to FFmpeg`));
      }, timeoutMs);
    }
  });
}

export async function runExportPipeline(
  element: HTMLElement,
  config: ExportConfig,
  onProgress: (state: Partial<ExportState>) => void
) {
  Telemetry.logEvent('EXPORT_STARTED', { format: config.format, resolution: config.resolution });

  // export-warning-leave: register beforeunload to warn user when attempting to close tab during active render
  const preventClose = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = 'Exportação em andamento. Se você fechar a página, o progresso será perdido.';
    return e.returnValue;
  };
  window.addEventListener('beforeunload', preventClose);

  try {
    // Check if we can use WebCodecs (Hardware Acceleration)
    // WebCodecs standalone lacks an audio multiplexer in our current architecture.
    const isVideo = config.format === 'mp4' || config.format === 'mov';
    if (isVideo && typeof VideoEncoder !== 'undefined') {
      const isWebm = config.format === 'mov';
      const codecString = isWebm ? 'vp09.00.10.08' : 'avc1.4d0028';
      
      const [wStr, hStr] = (config.resolution || "1920x1080").split('x') as [string, string];
      const width = parseInt(wStr, 10);
      const height = parseInt(hStr, 10);
      const safeWidth = width % 2 === 0 ? width : width - 1;
      const safeHeight = height % 2 === 0 ? height : height - 1;

      try {
        const configSupport = await VideoEncoder.isConfigSupported({
          codec: codecString,
          width: safeWidth,
          height: safeHeight,
        });

        if (configSupport.supported) {
          try {
            return await exportWithWebCodecs(element, config, onProgress, safeWidth, safeHeight);
          } catch (webcodecsError) {
            console.warn('[Export] WebCodecs execution failed. Falling back to FFmpeg.', webcodecsError);
            Telemetry.logEvent('WEBCODECS_FALLBACK', { format: config.format, error: String(webcodecsError) });
          }
        }
      } catch (e) {
        console.warn('[Export] WebCodecs support check failed', e);
      }
    }

    // Fallback to existing FFmpeg.wasm / PNG Sequence pipeline
    console.warn('[Export] WebCodecs not supported or not a video. Falling back to FFmpeg/Zip.');
    Telemetry.logEvent('WEBCODECS_FALLBACK', { format: config.format });
    return await exportWithFFmpeg(element, config, onProgress);
  } finally {
    window.removeEventListener('beforeunload', preventClose);
  }
}

async function exportWithWebCodecs(
  element: HTMLElement,
  config: ExportConfig,
  onProgress: (state: Partial<ExportState>) => void,
  width: number,
  height: number
) {
  let worker: Worker | null = null;
  try {
    const { fps, duration, format } = config;
    const totalFrames = Math.floor(duration * fps);
    const frameInterval = 1 / fps;

    onProgress({
      isExporting: true,
      stage: 'capturing', // it does capturing and encoding in parallel
      progress: 0,
      totalFrames,
      currentFrame: 0,
      errorMessage: undefined,
    });

    gsap.globalTimeline.pause();
    useEditorStore.getState().setActiveCompositionLayerId(null);

    const allVideos = Array.from(element.querySelectorAll('video')) as HTMLVideoElement[];
    allVideos.forEach(vid => vid.pause());
    const bgVideo = allVideos.find(vid => vid.id === 'export-bg-video');

    worker = new ExportWorker();

    await sendAndWait(worker, {
      type: 'INIT',
      config: {
        width,
        height,
        fps,
        format, // 'mp4' | 'mov'
        bitrate: 8_000_000,
        totalFrames,
      } as ExportWorkerConfig
    }, 'READY', 15_000); // 15s timeout — falls back to FFmpeg if worker hangs

    const MAX_IN_FLIGHT = 3;
    let inFlight = 0;
    let framesEncodedCount = 0;
    let workerError: Error | null = null;

    worker.addEventListener('message', (e) => {
      if (e.data.type === 'PROGRESS') {
        inFlight--;
        framesEncodedCount = e.data.framesEncoded;
        onProgress({
          progress: (framesEncodedCount / totalFrames) * 100,
        });
      } else if (e.data.type === 'ERROR') {
        workerError = new Error(e.data.message);
      }
    });

    const offscreenCanvas = new OffscreenCanvas(width, height);
    const ctx = offscreenCanvas.getContext('2d')!;

    for (let frame = 0; frame < totalFrames; frame++) {
      if (workerError) {
        throw workerError;
      }
      if (!useEditorStore.getState().exportState.isExporting) {
        throw new Error('EXPORT_CANCELLED');
      }

      const time = frame * frameInterval;
      const timestamp = Math.round(time * 1_000_000); // in microseconds

      gsap.globalTimeline.seek(time);
      useEditorStore.getState().seek(time);

      allVideos.forEach(vid => {
        if (vid.id === 'export-bg-video') {
          const trimStart = config.bgTrimStart || 0;
          const trimEnd = config.bgTrimEnd || vid.duration || Infinity;
          let videoTime = trimStart + time;
          if (trimEnd > trimStart && videoTime > trimEnd) {
             videoTime = trimEnd;
          }
          vid.currentTime = videoTime;
        } else {
          const startTime = parseFloat(vid.getAttribute('data-start-time') || '0');
          const localTime = Math.max(0, time - startTime);
          vid.currentTime = localTime % (vid.duration || 1);
        }
      });

      await backgroundDelay(50);

      const compVideos = allVideos.filter(vid => vid.id !== 'export-bg-video');
      const videoPlaceholders = compVideos.map(vid => {
        const canvas = document.createElement('canvas');
        canvas.width = vid.videoWidth || width;
        canvas.height = vid.videoHeight || height;
        canvas.getContext('2d')?.drawImage(vid, 0, 0);
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.cssText = vid.style.cssText;
        vid.style.display = 'none';
        vid.parentNode?.insertBefore(img, vid);
        return { vid, img };
      });

      if (bgVideo) bgVideo.style.display = 'none';
      
      const blob = await captureFrame(element, { width, height });
      
      if (bgVideo) bgVideo.style.display = 'block';
      
      videoPlaceholders.forEach(({ vid, img }) => {
        vid.style.display = '';
        img.remove();
      });

      // Composite frame
      ctx.clearRect(0, 0, width, height);
      if (bgVideo) {
        ctx.drawImage(bgVideo, 0, 0, width, height);
      } else if (config.format !== 'mov') {
        ctx.fillStyle = config.backgroundColor || '#000000';
        ctx.fillRect(0, 0, width, height);
      } else {
        // For MOV (Alpha QuickTime), paint transparent
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, width, height);
      }

      const img = new Image();
      const url = URL.createObjectURL(blob);
      await new Promise(r => { img.onload = r; img.src = url; });
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      // Enterprise Watermark
      if (config.includeWatermark !== false) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '500 16px var(--font-sans, Inter, sans-serif)';
        ctx.textAlign = 'right';
        ctx.fillText('Made with Pelimotion Pro', width - 20, height - 20);
      }

      const bitmap = await createImageBitmap(offscreenCanvas);

      while (inFlight >= MAX_IN_FLIGHT) {
        if (workerError) {
          throw workerError;
        }
        await backgroundDelay(2);
      }

      inFlight++;
      worker.postMessage(
        {
          type: 'ENCODE_FRAME',
          bitmap,
          timestamp,
          isKeyFrame: frame % (fps * 2) === 0,
          totalFrames,
        },
        [bitmap]
      );

      onProgress({
        currentFrame: frame + 1,
      });
    }

    // Wait for all frames to be encoded
    while (framesEncodedCount < totalFrames) {
      if (workerError) {
        throw workerError;
      }
      if (!useEditorStore.getState().exportState.isExporting) {
        throw new Error('EXPORT_CANCELLED');
      }
      await backgroundDelay(50);
    }

    onProgress({ stage: 'encoding' }); // just to update the text if needed, but it's done

    const { buffer } = await sendAndWait(worker, { type: 'FINALIZE' }, 'COMPLETE');
    worker.terminate();
    worker = null;

    const fileNameTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalName = `pelimotion-asset-${fileNameTimestamp}.${format}`;
    const mime = format === 'mp4' ? 'video/mp4' : 'video/quicktime';
    
    const audioTracks = useEditorStore.getState().audioTracks;
    const hasAudio = audioTracks && audioTracks.some(t => !t.muted);
    
    let finalBlob: Blob;
    if (hasAudio) {
      onProgress({ stage: 'encoding', errorMessage: 'Multiplexando Áudio (Mux)...', progress: 95 });
      const audioWav = await mixAudioTracksToWav(audioTracks, duration);
      if (audioWav) {
        const videoData = new Uint8Array(buffer as ArrayBuffer);
        const muxedData = await muxVideoAndAudioWithFFmpeg(videoData, audioWav, format as 'mp4' | 'mov', (prog) => {
          onProgress({ progress: 95 + (prog * 0.05) });
        }, () => !useEditorStore.getState().exportState.isExporting);
        finalBlob = new Blob([muxedData.buffer as ArrayBuffer], { type: mime });
      } else {
        finalBlob = new Blob([buffer as ArrayBuffer], { type: mime });
      }
    } else {
      finalBlob = new Blob([buffer as ArrayBuffer], { type: mime });
    }
    
    const url = URL.createObjectURL(finalBlob);
    downloadFile(url, finalName);
    URL.revokeObjectURL(url);

    allVideos.forEach(vid => vid.play());
    gsap.globalTimeline.play();

    Telemetry.logEvent('EXPORT_COMPLETED', { engine: 'webcodecs' });
    onProgress({ stage: 'complete', progress: 100, isExporting: false, errorMessage: undefined });

  } catch (error: any) {
    if (error.message === 'EXPORT_CANCELLED') {
      console.log('WebCodecs Export was cancelled.');
      if (worker) {
        worker.postMessage({ type: 'ABORT' });
        worker.terminate();
      }
      gsap.globalTimeline.play();
      onProgress({ stage: 'idle', isExporting: false, progress: 0 });
      return;
    }

    console.error('WebCodecs Export failed:', error);
    Telemetry.logEvent('EXPORT_CANCELLED', { engine: 'webcodecs', error: error.message });
    if (worker) {
      worker.postMessage({ type: 'ABORT' });
      worker.terminate();
    }
    gsap.globalTimeline.play();
    console.warn('[Export] Auto-falling back to FFmpeg pipeline...');
    return exportWithFFmpeg(element, config, onProgress);
  }
}

async function exportWithFFmpeg(
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

    const audioTracks = useEditorStore.getState().audioTracks
    let audioWav: Uint8Array | null = null
    if (audioTracks && audioTracks.length > 0) {
      onProgress({ stage: 'encoding', errorMessage: 'Sintetizando Áudio...' })
      audioWav = await mixAudioTracksToWav(audioTracks, duration)
    }

    // Freeze global time
    gsap.globalTimeline.pause()
    
    // Hide Gizmo and selections
    useEditorStore.getState().setActiveCompositionLayerId(null)

    const frames: Uint8Array[] = []
    const zipPayload: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {}

    const allVideos = Array.from(element.querySelectorAll('video')) as HTMLVideoElement[]
    allVideos.forEach(vid => vid.pause())
    const bgVideo = allVideos.find(vid => vid.id === 'export-bg-video')

    for (let frame = 0; frame < totalFrames; frame++) {
      if (!useEditorStore.getState().exportState.isExporting) {
        throw new Error('EXPORT_CANCELLED');
      }

      // If png-still, we use the selected stillFrame time, else sequential
      const frameIndex = format === 'png-still' ? stillFrame : frame
      const time = frameIndex * frameInterval
      
      // Advance GSAP strictly to this frame's time
      gsap.globalTimeline.seek(time)
      
      // Advance React State so CompositionPreview updates visibility
      useEditorStore.getState().seek(time)

      // Sync all videos
      allVideos.forEach(vid => {
        if (vid.id === 'export-bg-video') {
          const trimStart = config.bgTrimStart || 0;
          const trimEnd = config.bgTrimEnd || vid.duration || Infinity;
          let videoTime = trimStart + time;
          if (trimEnd > trimStart && videoTime > trimEnd) {
             videoTime = trimEnd;
          }
          vid.currentTime = videoTime;
        } else {
          const startTime = parseFloat(vid.getAttribute('data-start-time') || '0');
          const localTime = Math.max(0, time - startTime);
          vid.currentTime = localTime % (vid.duration || 1);
        }
      });

      // Wait a tiny bit for the DOM to flush styles/layout and video to seek
      await backgroundDelay(50)
      
      // Replace composition videos with static images so html-to-image can capture them
      const compVideos = allVideos.filter(vid => vid.id !== 'export-bg-video')
      const videoPlaceholders = compVideos.map(vid => {
        const canvas = document.createElement('canvas')
        canvas.width = vid.videoWidth || width
        canvas.height = vid.videoHeight || height
        canvas.getContext('2d')?.drawImage(vid, 0, 0)
        const img = document.createElement('img')
        img.src = canvas.toDataURL('image/png')
        img.style.cssText = vid.style.cssText
        vid.style.display = 'none'
        vid.parentNode?.insertBefore(img, vid)
        return { vid, img }
      })

      if (bgVideo) bgVideo.style.display = 'none'
      
      // Capture the frame (without bgVideo for speed and cross-origin safety, but with composition video imgs)
      const blob = await captureFrame(element, { width, height })
      
      if (bgVideo) bgVideo.style.display = 'block'
      
      videoPlaceholders.forEach(({ vid, img }) => {
        vid.style.display = ''
        img.remove()
      })
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      
      if (bgVideo) {
        ctx.drawImage(bgVideo, 0, 0, width, height)
      }
      
      const img = new Image()
      const url = URL.createObjectURL(blob)
      await new Promise(r => { img.onload = r; img.src = url })
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)

      // Enterprise Watermark
      if (config.includeWatermark !== false) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '500 16px var(--font-sans, Inter, sans-serif)';
        ctx.textAlign = 'right';
        ctx.fillText('Made with Pelimotion Pro', width - 20, height - 20);
      }
      
      const isJpeg = format === 'mp4'
      const mime = isJpeg ? 'image/jpeg' : 'image/png'
      const finalCanvasBlob = await new Promise<Blob>(r => canvas.toBlob(r as any, mime, 0.9))
      const arrayBuffer = await finalCanvasBlob.arrayBuffer()
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
      finalName = `pelimotion-asset-${fileNameTimestamp}.png`
    } 
    else if (format === 'png-sequence') {
      const zipBuffer = await new Promise<Uint8Array>((resolve, reject) => {
        zip(zipPayload, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      })
      finalBlob = new Blob([zipBuffer as any], { type: 'application/zip' })
      finalName = `pelimotion-asset-${fileNameTimestamp}.zip`
    }
    else if (format === 'mp4' || format === 'mov') {
      const videoBuffer = await encodeVideoWithFFmpeg(frames, fps, format, audioWav, (prog) => {
        onProgress({ progress: prog })
      }, () => !useEditorStore.getState().exportState.isExporting)
      const mime = format === 'mp4' ? 'video/mp4' : 'video/quicktime'
      finalBlob = new Blob([videoBuffer as any], { type: mime })
      finalName = `pelimotion-asset-${fileNameTimestamp}.${format}`
    }

    if (finalBlob && finalName) {
      // 1. Download locally
      const url = URL.createObjectURL(finalBlob)
      downloadFile(url, finalName)
      URL.revokeObjectURL(url)
    }

    // Restore playback
    allVideos.forEach(vid => vid.play())
    gsap.globalTimeline.play()

    Telemetry.logEvent('EXPORT_COMPLETED', { engine: 'ffmpeg' });
    onProgress({ stage: 'complete', progress: 100, isExporting: false, errorMessage: undefined })
  } catch (error: any) {
    if (error.message === 'EXPORT_CANCELLED') {
      console.log('FFmpeg Export was cancelled.');
      gsap.globalTimeline.play();
      onProgress({ stage: 'idle', isExporting: false, progress: 0 });
      return;
    }

    console.error('Export failed:', error)
    Telemetry.logEvent('EXPORT_FAILED', { engine: 'ffmpeg', error: error.message });
    gsap.globalTimeline.play()
    onProgress({ 
      stage: 'error', 
      isExporting: false, 
      errorMessage: error.message || 'Unknown export error' 
    })
  }
}
