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

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.getState().undo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z  or  Cmd/Ctrl + Y
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        useEditorStore.getState().redo();
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        const { showShortcuts, setShowShortcuts } = useEditorStore.getState();
        setShowShortcuts(!showShortcuts);
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
          // v3.0: Universal layer takes priority
          if (state.selectedLayerId) {
            state.removeLayer(state.selectedLayerId);
          } else if (state.activeCompositionLayerId) {
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

            // v3.0: Universal layer duplication
            if (state.selectedLayerId) {
              state.duplicateLayer(state.selectedLayerId);
              break;
            }

            const ct = state.currentTime;

            if (e.shiftKey) {
              // SPLIT LAYER (Cmd+Shift+D)
              if (state.activeCompositionLayerId) {
                const layer = state.compositionLayers.find(l => l.id === state.activeCompositionLayerId);
                if (layer && ct > layer.startTime && ct < layer.startTime + layer.duration) {
                  const newDuration1 = ct - layer.startTime;
                  const newDuration2 = (layer.startTime + layer.duration) - ct;
                  state.updateCompositionLayer(layer.id, { duration: newDuration1 });
                  const duplicate = { ...layer, id: crypto.randomUUID(), startTime: ct, duration: newDuration2 };
                  state.addCompositionLayer(duplicate);
                  state.setActiveCompositionLayerId(duplicate.id);
                }
              } else if (state.activeAudioTrackId) {
                const track = state.audioTracks.find(t => t.id === state.activeAudioTrackId);
                if (track && ct > track.startTime && ct < track.startTime + track.duration) {
                  const newDuration1 = ct - track.startTime;
                  const newDuration2 = (track.startTime + track.duration) - ct;
                  state.updateAudioTrack(track.id, { duration: newDuration1 });
                  const duplicate = { ...track, id: crypto.randomUUID(), startTime: ct, duration: newDuration2 };
                  state.addAudioTrack(duplicate);
                  state.setActiveAudioTrackId(duplicate.id);
                }
              }
            } else {
              // DUPLICATE LAYER (Cmd+D)
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
          }
          break;
        }
        case 'KeyC': {
          if (e.metaKey || e.ctrlKey) {
            const state = useEditorStore.getState();
            if (state.activeCompositionLayerId) {
              const layer = state.compositionLayers.find(l => l.id === state.activeCompositionLayerId);
              if (layer) state.setClipboard({ type: 'composition', data: layer });
            } else if (state.activeAudioTrackId) {
              const track = state.audioTracks.find(t => t.id === state.activeAudioTrackId);
              if (track) state.setClipboard({ type: 'audio', data: track });
            } else if (state.activeTypoLayerId) {
              const layer = state.motionConfig.typography.layers.find(l => l.id === state.activeTypoLayerId);
              if (layer) state.setClipboard({ type: 'typography', data: layer });
            } else if (state.activeGenerativeLayerId) {
              const layer = state.generativeLayers.find(l => l.id === state.activeGenerativeLayerId);
              if (layer) state.setClipboard({ type: 'generative', data: layer });
            }
          }
          break;
        }
        case 'KeyV': {
          if (e.metaKey || e.ctrlKey) {
            const state = useEditorStore.getState();
            if (!state.clipboard) return;

            const ct = state.currentTime;
            const cb = state.clipboard;

            if (cb.type === 'composition') {
              const duplicate = { ...cb.data, id: crypto.randomUUID(), startTime: ct };
              state.addCompositionLayer(duplicate);
              state.setActiveCompositionLayerId(duplicate.id);
            } else if (cb.type === 'audio') {
              const duplicate = { ...cb.data, id: crypto.randomUUID(), startTime: ct };
              state.addAudioTrack(duplicate);
              state.setActiveAudioTrackId(duplicate.id);
            } else if (cb.type === 'typography') {
              const duplicate = { ...cb.data, id: crypto.randomUUID() };
              state.addTypoLayer(duplicate);
              state.setActiveTypoLayer(duplicate.id);
            } else if (cb.type === 'generative') {
              const duplicate = { ...cb.data, id: crypto.randomUUID() };
              state.addGenerativeLayer(duplicate);
              state.setActiveGenerativeLayerId(duplicate.id);
            }
          }
          break;
        }
        case 'Escape': {
          const escState = useEditorStore.getState();
          // Close ShortcutsHUD first if it's open
          if (escState.showShortcuts) {
            escState.setShowShortcuts(false);
          } else {
            // v3.0: Deselect universal layer
            escState.setSelectedLayerId(null);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
