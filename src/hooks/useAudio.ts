import { useCallback, useRef } from 'react';

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const speakLetter = useCallback((letter: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any pending speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.rate = 1.2;
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
