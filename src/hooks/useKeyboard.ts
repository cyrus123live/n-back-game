import { useEffect, useCallback } from 'react';
import type { StimulusType } from '../types';
import { KEY_MAP } from '../types';

export function useKeyboard(
  activeStimuli: StimulusType[],
  onMatch: (type: StimulusType) => void,
  enabled: boolean
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const key = e.key.toLowerCase();
      const stimulusType = KEY_MAP[key];

      if (stimulusType && activeStimuli.includes(stimulusType)) {
        e.preventDefault();
        onMatch(stimulusType);
      }
    },
    [activeStimuli, onMatch, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
