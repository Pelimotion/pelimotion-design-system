import { Output, Mp4OutputFormat, WebMOutputFormat, BufferTarget, VideoSampleSource, VideoSample } from 'mediabunny'

export type ExportWorkerConfig = {
  width: number;
  height: number;
  fps: number;
  format: 'mp4' | 'mov' | 'png-sequence' | 'png-still';
  bitrate?: number;
  totalFrames: number;
};

export type WorkerInMessage =
  | { type: 'INIT'; config: ExportWorkerConfig }
  | { type: 'ENCODE_FRAME'; bitmap: ImageBitmap; timestamp: number; isKeyFrame: boolean; totalFrames: number }
  | { type: 'FINALIZE' }
  | { type: 'ABORT' }

export type WorkerOutMessage =
  | { type: 'READY' }
  | { type: 'PROGRESS'; framesEncoded: number; totalFrames: number }
  | { type: 'COMPLETE'; buffer: ArrayBuffer }
  | { type: 'ERROR'; message: string }

let output: Output | undefined;
let videoSource: VideoSampleSource | undefined;
let framesEncoded = 0;

self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data;

  try {
    if (msg.type === 'INIT') {
      const { width, height, fps, format, bitrate } = msg.config;

      // Ensure even dimensions for video codecs (like H.264)
      const safeWidth = width % 2 === 0 ? width : width - 1;
      const safeHeight = height % 2 === 0 ? height : height - 1;

      const isWebm = format === 'mov'; // WebM internally if they requested VP9/mov in the prompt's context. The prompt says 'mov' for VP9 w/ Alpha or Bg. We'll use Webm muxer for VP9 if format is mov.
      const webcodecsCodec = isWebm ? 'vp09.00.10.08' : 'avc1.4d0028'; // VP9 or H.264 High Profile Level 4
      const mediabunnyCodec = isWebm ? 'vp9' : 'avc';

      // Check hardware acceleration support
      const support = await VideoEncoder.isConfigSupported({
        codec: webcodecsCodec,
        width: safeWidth,
        height: safeHeight,
        hardwareAcceleration: 'prefer-hardware',
      });

      output = new Output({
        format: isWebm ? new WebMOutputFormat() : new Mp4OutputFormat(),
        target: new BufferTarget(),
      });

      videoSource = new VideoSampleSource({
        codec: mediabunnyCodec as any,
        bitrate: bitrate ?? 8_000_000, // 8 Mbps default
        hardwareAcceleration: support.supported ? 'prefer-hardware' : 'prefer-software',
        transform: {
          width: safeWidth,
          height: safeHeight,
          frameRate: fps,
          fit: 'fill',
        }
      });

      output.addVideoTrack(videoSource);

      await output.start();
      self.postMessage({ type: 'READY' });
    }

    if (msg.type === 'ENCODE_FRAME') {
      if (!videoSource) throw new Error("Worker not initialized with video source");
      
      const { bitmap, timestamp, totalFrames } = msg;
      const frame = new VideoFrame(bitmap, { timestamp });
      
      // Crucial: close the ImageBitmap to release GPU memory
      bitmap.close();

      const sample = new VideoSample(frame);
      await videoSource.add(sample);
      
      sample.close();

      framesEncoded++;
      self.postMessage({ type: 'PROGRESS', framesEncoded, totalFrames });
    }

    if (msg.type === 'FINALIZE') {
      if (!output) throw new Error("Worker not initialized with output");
      await output.finalize();
      const buffer = (output.target as BufferTarget).buffer as ArrayBuffer;
      (self as any).postMessage({ type: 'COMPLETE', buffer }, [buffer]);
    }

    if (msg.type === 'ABORT') {
      output?.cancel?.();
      self.close();
    }
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', message: error.message || String(error) });
  }
};
