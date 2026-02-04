import { useState, useCallback, useEffect, useMemo } from 'react';
import type { StimulusType, GameSettings, SessionResults } from '../../types';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useAudio } from '../../hooks/useAudio';
import { getComboGlow } from '../../lib/scoring';
import { GameGrid } from './GameGrid';
import { MatchButtons } from './MatchButtons';
import { ComboCounter } from './ComboCounter';
import { TrialProgress } from './TrialProgress';

interface GameScreenProps {
  settings: GameSettings;
  onFinish: (results: SessionResults, overallScore: number, xpEarned: number, maxCombo: number) => void;
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
        setFlashClass('flash-red');
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
      onFinish(results, overallScore, xpEarned, gameState.maxCombo);
    }
  }, [gameState.phase]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleMatch = useCallback(
    (type: StimulusType) => {
      if (pressedThisTrial.has(type)) return;
      respondMatch(type);
      setPressedThisTrial((prev) => new Set(prev).add(type));
      playComboTone(gameState.combo);
    },
    [respondMatch, pressedThisTrial, playComboTone, gameState.combo]
  );

  useKeyboard(settings.activeStimuli, handleMatch, gameState.phase === 'playing');

  const glowClass = useMemo(() => getComboGlow(gameState.combo), [gameState.combo]);

  if (gameState.phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="text-8xl font-black text-primary-400 animate-bounce-in" key={countdown}>
          {countdown}
        </div>
        <p className="text-gray-400">Get ready...</p>
        <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-300">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 py-4 transition-all duration-500 ${glowClass}`}>
      <div className="flex items-center justify-between w-full max-w-md px-2">
        <ComboCounter combo={gameState.combo} maxCombo={gameState.maxCombo} />
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-300 px-3 py-1"
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
      />

      <p className="text-xs text-gray-500 mt-2">
        Press the key when the current stimulus matches {settings.nLevel} back
      </p>
    </div>
  );
}
