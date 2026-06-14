import { FFmpeg } from '@ffmpeg/ffmpeg'

export async function encodeVideoWithFFmpeg(
  frames: Uint8Array[],
  fps: number,
  format: 'mp4' | 'mov',
  audioWav: Uint8Array | null,
  onProgress: (prog: number) => void
): Promise<Uint8Array> {
  const ffmpeg = new FFmpeg()

  ffmpeg.on('progress', ({ progress }) => {
    // progress is 0 to 1
    onProgress(Math.min(100, Math.max(0, progress * 100)))
  })

  // Load from unpkg
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
  })

  const ext = format === 'mp4' ? 'jpg' : 'png'
  // Write PNG frames to virtual FS
  for (let i = 0; i < frames.length; i++) {
    const frameName = `frame_${String(i).padStart(4, '0')}.${ext}`
    await ffmpeg.writeFile(frameName, frames[i] as any)
  }

  const outName = `output.${format}`
  const args = [
    '-framerate', `${fps}`,
    '-i', `frame_%04d.${ext}`
  ]

  if (format === 'mp4') {
    // Standard H.264 MP4 (no alpha). Scale ensures even dimensions to avoid libx264 errors
    args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2')
  } else if (format === 'mov') {
    // QuickTime Animation (RLE) or PNG codec for Alpha support
    args.push('-c:v', 'png', '-pix_fmt', 'rgba')
  }

  if (audioWav) {
    await ffmpeg.writeFile('mixed_audio.wav', audioWav as any)
    // Insert audio input before the video encoding options, or after video input
    // The easiest is to reconstruct args
    const newArgs = [
      '-framerate', `${fps}`,
      '-i', `frame_%04d.${ext}`,
      '-i', 'mixed_audio.wav'
    ]
    if (format === 'mp4') {
      newArgs.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2')
    } else {
      newArgs.push('-c:v', 'png', '-pix_fmt', 'rgba')
    }
    newArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest')
    newArgs.push(outName)
    
    await ffmpeg.exec(newArgs)
  } else {
    args.push(outName)
    await ffmpeg.exec(args)
  }

  const data = await ffmpeg.readFile(outName)
  return data as Uint8Array
}

export async function muxVideoAndAudioWithFFmpeg(
  videoData: Uint8Array,
  audioWav: Uint8Array,
  format: 'mp4' | 'mov',
  onProgress?: (prog: number) => void
): Promise<Uint8Array> {
  const ffmpeg = new FFmpeg()

  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      onProgress(Math.min(100, Math.max(0, progress * 100)))
    })
  }

  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
  })

  const videoName = `input_video.${format}`
  const audioName = 'input_audio.wav'
  const outName = `output.${format}`

  await ffmpeg.writeFile(videoName, videoData as any)
  await ffmpeg.writeFile(audioName, audioWav as any)

  // -c:v copy tells FFmpeg to just copy the video stream, preventing any re-encoding.
  // -c:a aac compresses the WAV audio into AAC format.
  // -shortest ensures the output is clipped to the shortest input stream.
  const args = [
    '-i', videoName,
    '-i', audioName,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    outName
  ]

  await ffmpeg.exec(args)

  const data = await ffmpeg.readFile(outName)
  return data as Uint8Array
}
