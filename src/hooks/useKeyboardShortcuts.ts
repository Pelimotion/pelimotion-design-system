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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
