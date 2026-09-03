import { useEffect } from 'react';
import { playClick, playThud, playChime } from '@design-engineer/audio';

interface AudioFeedbackOptions {
  clickOnClick?: boolean;
  thudOnMouseDown?: boolean;
  chimeOnKeyDown?: boolean;
}

export function useAudioFeedback(options: AudioFeedbackOptions = { clickOnClick: true }) {
  useEffect(() => {
    const handleMouseDown = () => {
      if (options.thudOnMouseDown) {
        playThud();
      } else if (options.clickOnClick) {
        playClick();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (options.chimeOnKeyDown && e.key === 'Enter') {
        playChime();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options.clickOnClick, options.thudOnMouseDown, options.chimeOnKeyDown]);
}
