import { useCallback } from 'react';

// Module-level singleton so it persists and can be unlocked once
let sharedAudioContext: AudioContext | null = null;

function getSharedContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContext();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

// Unlock audio on first user interaction anywhere on the page
function setupGlobalUnlock() {
  const unlock = () => {
    getSharedContext();
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('keydown', unlock);
  };
  document.addEventListener('click', unlock, { once: true });
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });
}

if (typeof document !== 'undefined') {
  setupGlobalUnlock();
}

export function useAudio() {
  const getContext = useCallback(() => {
    return getSharedContext();
  }, []);

  const speakLetter = useCallback((letter: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any pending speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter.toLowerCase());
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number = 0.1, type: OscillatorType = 'sine') => {
      try {
        const ctx = getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch {
        // Audio not available
      }
    },
    [getContext]
  );

  const playCorrect = useCallback(() => {
    playTone(880, 0.15, 'sine');
  }, [playTone]);

  const playIncorrect = useCallback(() => {
    playTone(220, 0.2, 'square');
  }, [playTone]);

  const playComboTone = useCallback(
    (combo: number) => {
      // Rising pitch with combo
      const baseFreq = 440 + combo * 40;
      playTone(Math.min(baseFreq, 1200), 0.12, 'sine');
    },
    [playTone]
  );

  return { speakLetter, playCorrect, playIncorrect, playComboTone, playTone };
}
