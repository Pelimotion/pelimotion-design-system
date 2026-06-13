import type { AudioTrack } from '@/types/motion.types';

/**
 * Converte um AudioBuffer em um Blob no formato WAV.
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i] ?? 0;
      result[i * 2 + 1] = right[i] ?? 0;
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const dataLength = result.length * (bitDepth / 8);
  const bufferArray = new ArrayBuffer(44 + dataLength);
  const view = new DataView(bufferArray);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const s = Math.max(-1, Math.min(1, result[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Mixa as faixas de áudio em um único Blob WAV.
 */
export async function mixAudioTracksToWav(tracks: AudioTrack[], totalDuration: number): Promise<Uint8Array | null> {
  const activeTracks = tracks.filter(t => !t.muted);
  if (activeTracks.length === 0) return null;

  const sampleRate = 44100;
  const length = Math.ceil(sampleRate * totalDuration);
  const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

  for (const track of activeTracks) {
    try {
      const response = await fetch(track.src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

      const sourceNode = offlineCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = track.volume ?? 1;

      sourceNode.connect(gainNode);
      gainNode.connect(offlineCtx.destination);

      // Handle trimStart and trimEnd implicitly or explicitly via start parameters
      const trimStart = track.trimStart || 0;
      const playDuration = Math.min(track.duration, audioBuffer.duration - trimStart);
      
      sourceNode.start(track.startTime, trimStart, playDuration);
    } catch (e) {
      console.warn('Falha ao carregar faixa de áudio para mixagem:', track.name, e);
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWav(renderedBuffer);
  
  return new Uint8Array(await wavBlob.arrayBuffer());
}
