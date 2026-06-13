import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          useEditorStore.getState().togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          const { currentTime: ctL, seek: seekL } = useEditorStore.getState();
          seekL(Math.max(0, ctL - 0.1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          const { currentTime: ctR, exportConfig, seek: seekR } = useEditorStore.getState();
          seekR(Math.max(0, Math.min(exportConfig.duration, ctR + 0.1)));
          break;
        case 'Backspace':
        case 'Delete': {
          const state = useEditorStore.getState();
          if (state.activeCompositionLayerId) {
            state.removeCompositionLayer(state.activeCompositionLayerId);
            state.setActiveCompositionLayerId(null);
          } else if (state.activeAudioTrackId) {
            state.removeAudioTrack(state.activeAudioTrackId);
            state.setActiveAudioTrackId(null);
          } else if (state.activeTypoLayerId) {
            state.removeTypoLayer(state.activeTypoLayerId);
            state.setActiveTypoLayer(null);
          } else if (state.activeGenerativeLayerId) {
            state.removeGenerativeLayer(state.activeGenerativeLayerId);
            state.setActiveGenerativeLayerId(null);
          }
          break;
        }
        case 'KeyD': {
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            const state = useEditorStore.getState();
            if (state.activeCompositionLayerId) {
              const layer = state.compositionLayers.find(l => l.id === state.activeCompositionLayerId);
              if (layer) {
                const duplicate = { ...layer, id: crypto.randomUUID(), startTime: Math.min(layer.startTime + 0.5, state.exportConfig.duration) };
                state.addCompositionLayer(duplicate);
                state.setActiveCompositionLayerId(duplicate.id);
              }
            } else if (state.activeAudioTrackId) {
              const track = state.audioTracks.find(t => t.id === state.activeAudioTrackId);
              if (track) {
                const duplicate = { ...track, id: crypto.randomUUID(), startTime: Math.min(track.startTime + 0.5, state.exportConfig.duration) };
                state.addAudioTrack(duplicate);
                state.setActiveAudioTrackId(duplicate.id);
              }
            }
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
