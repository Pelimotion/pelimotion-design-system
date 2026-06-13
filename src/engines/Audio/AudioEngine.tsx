import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export function AudioEngine() {
  const { audioTracks, currentTime, isPlaying } = useEditorStore();
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  useEffect(() => {
    audioTracks.forEach(track => {
      const audio = audioRefs.current[track.id];
      if (audio) {
        if (track.muted) {
           if (!audio.paused) audio.pause();
           return;
        }
        
        const isVisible = currentTime >= track.startTime && currentTime <= track.startTime + track.duration;
        if (isVisible) {
          const localTime = (currentTime - track.startTime) + (track.trimStart || 0);
          if (Math.abs(audio.currentTime - localTime) > 0.1) {
            audio.currentTime = localTime;
          }
          audio.volume = track.volume ?? 1;
          
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
