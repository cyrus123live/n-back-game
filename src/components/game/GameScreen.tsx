import { useState, useCallback, useEffect, useMemo } from 'react';
import type { StimulusType, GameSettings, SessionResults } from '../../types';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useAudio } from '../../hooks/useAudio';
import { GameGrid } from './GameGrid';
import { MatchButtons } from './MatchButtons';
import type { ButtonFeedback } from './MatchButtons';
import { ComboCounter } from './ComboCounter';
import { TrialProgress } from './TrialProgress';

interface GameScreenProps {
  settings: GameSettings;
  onFinish: (
    results: SessionResults,
    overallScore: number,
    xpEarned: number,
    maxCombo: number,
    adaptiveData?: {
      adaptive: boolean;
      startingLevel: number;
      endingLevel: number;
    }
  ) => void;
  onCancel: () => void;
}

export function GameScreen({ settings, onFinish, onCancel }: GameScreenProps) {
  const [flashClass, setFlashClass] = useState('');
  const [pressedThisTrial, setPressedThisTrial] = useState<Set<StimulusType>>(new Set());

  const { speakLetter, playCorrect, playIncorrect, playComboTone } = useAudio();

  const handleTrialAdvance = useCallback(
    (feedback: Map<StimulusType, 'hit' | 'miss' | 'falseAlarm' | 'correctRejection'>) => {
      let hasWrong = false;
      let hasMiss = false;

      for (const [, result] of feedback) {
        if (result === 'falseAlarm') hasWrong = true;
        if (result === 'miss') hasMiss = true;
      }

      if (hasWrong) {
        setFlashClass('flash-miss');
        playIncorrect();
      } else if (hasMiss) {
        setFlashClass('flash-orange');
      } else {
        setFlashClass('flash-green');
        playCorrect();
      }

      setPressedThisTrial(new Set());
      setTimeout(() => setFlashClass(''), 400);
    },
    [playCorrect, playIncorrect]
  );

  const {
    gameState,
    startGame,
    respondMatch,
    currentStimulus,
    results,
    overallScore,
    xpEarned,
    countdown,
    adaptiveData,
  } = useGameLoop(handleTrialAdvance);

  // Start game on mount
  useEffect(() => {
    startGame(settings);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Speak audio letter when stimulus changes
  useEffect(() => {
    if (
      currentStimulus &&
      settings.activeStimuli.includes('audio') &&
      gameState.phase === 'playing'
    ) {
      speakLetter(currentStimulus.audio);
    }
  }, [gameState.currentTrial, gameState.phase]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Handle results
  useEffect(() => {
    if (gameState.phase === 'results' && results) {
      onFinish(
        results,
        overallScore,
        xpEarned,
        gameState.maxCombo,
        adaptiveData || undefined
      );
    }
  }, [gameState.phase]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleMatch = useCallback(
    (type: StimulusType) => {
      const wasPressed = respondMatch(type);
      if (wasPressed) {
        // Toggled off
        setPressedThisTrial((prev) => {
          const next = new Set(prev);
          next.delete(type);
          return next;
        });
      } else {
        // Toggled on
        setPressedThisTrial((prev) => new Set(prev).add(type));
        playComboTone(gameState.combo);
      }
    },
    [respondMatch, playComboTone, gameState.combo]
  );

  useKeyboard(settings.activeStimuli, handleMatch, gameState.phase === 'playing');

  // Convert trialFeedback to ButtonFeedback format for MatchButtons
  const buttonFeedback = useMemo(() => {
    if (!gameState.trialFeedback) return undefined;
    const map = new Map<StimulusType, ButtonFeedback>();
    for (const [type, result] of gameState.trialFeedback) {
      if (result === 'hit') map.set(type, 'correct');
      else if (result === 'miss') map.set(type, 'missed');
      else if (result === 'falseAlarm') map.set(type, 'wrong');
    }
    return map.size > 0 ? map : undefined;
  }, [gameState.trialFeedback]);

  if (gameState.phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="text-8xl font-black text-primary-500 animate-bounce-in" key={countdown}>
          {countdown}
        </div>
        <button onClick={onCancel} className="text-sm text-text-muted hover:text-text-secondary">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-4">
      <div className="flex items-center justify-between w-full max-w-md px-2">
        <ComboCounter combo={gameState.combo} maxCombo={gameState.maxCombo} />
        <button
          onClick={onCancel}
          className="text-sm text-text-muted hover:text-text-secondary px-3 py-1"
        >
          Quit
        </button>
      </div>

      <TrialProgress
        current={gameState.currentTrial}
        total={gameState.sequence.length}
        nLevel={settings.nLevel}
      />

      <GameGrid
        stimulus={currentStimulus}
        activeStimuli={settings.activeStimuli}
        flashClass={flashClass}
      />

      <MatchButtons
        activeStimuli={settings.activeStimuli}
        onMatch={handleMatch}
        pressedThisTrial={pressedThisTrial}
        disabled={gameState.phase !== 'playing'}
        feedback={buttonFeedback}
      />

      <p className="text-xs text-text-muted mt-2">
        Press the key when the current stimulus matches {settings.nLevel} back
      </p>
    </div>
  );
}
