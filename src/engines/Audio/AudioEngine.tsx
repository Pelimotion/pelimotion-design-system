import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export function AudioEngine() {
  const { audioTracks, currentTime, isPlaying } = useEditorStore();
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  useEffect(() => {
    const hasSolo = audioTracks.some(t => t.solo);

    audioTracks.forEach(track => {
      const audio = audioRefs.current[track.id];
      if (audio) {
        const isMuted = track.muted || (hasSolo && !track.solo);
        if (isMuted) {
           if (!audio.paused) audio.pause();
           return;
        }
        
        const isVisible = currentTime >= track.startTime && currentTime <= track.startTime + track.duration;
        if (isVisible) {
          const localTime = (currentTime - track.startTime) + (track.trimStart || 0);
          if (Math.abs(audio.currentTime - localTime) > 0.1) {
            audio.currentTime = localTime;
          }
          // Calculate volume with fades
          let targetVolume = track.volume ?? 1;
          const audioDuration = track.duration || audio.duration;
          
          if (track.fadeIn && localTime < track.fadeIn) {
            targetVolume = (track.volume ?? 1) * (localTime / track.fadeIn);
          } else if (track.fadeOut && localTime > audioDuration - track.fadeOut) {
            targetVolume = (track.volume ?? 1) * ((audioDuration - localTime) / track.fadeOut);
          }
          
          audio.volume = Math.max(0, Math.min(1, targetVolume));
          
          if (isPlaying && audio.paused) {
            audio.play().catch(() => {});
          } else if (!isPlaying && !audio.paused) {
            audio.pause();
          }
        } else {
          if (!audio.paused) audio.pause();
        }
      }
    });
  }, [currentTime, isPlaying, audioTracks]);

  return (
    <>
      {audioTracks.map(track => (
        <audio
          key={track.id}
          ref={el => { audioRefs.current[track.id] = el; }}
          src={track.src}
          preload="auto"
          style={{ display: 'none' }}
        />
      ))}
    </>
  );
}
