import { useState, useCallback, useRef, useEffect } from 'react';
import type { StimulusType, GameSettings, GameState, TrialStimulus, SessionResults } from '../types';
import { generateSequence, isMatch } from '../lib/sequence';
import { calculateResults, calculateOverallScore, calculateXP } from '../lib/scoring';

const COUNTDOWN_SECONDS = 3;

interface UseGameLoopReturn {
  gameState: GameState;
  startGame: (settings: GameSettings) => void;
  respondMatch: (type: StimulusType) => void;
  currentStimulus: TrialStimulus | null;
  settings: GameSettings | null;
  results: SessionResults | null;
  overallScore: number;
  xpEarned: number;
  countdown: number;
}

export function useGameLoop(
  onTrialAdvance?: (feedback: Map<StimulusType, 'hit' | 'miss' | 'falseAlarm' | 'correctRejection'>) => void
): UseGameLoopReturn {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'idle',
    currentTrial: 0,
    sequence: [],
    responses: new Map(),
    combo: 0,
    maxCombo: 0,
    feedbackType: null,
    trialFeedback: null,
  });

  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const respondedThisTrialRef = useRef<Set<StimulusType>>(new Set());

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const advanceTrial = useCallback(
    (
      currentTrial: number,
      sequence: TrialStimulus[],
      responses: Map<number, Set<StimulusType>>,
      combo: number,
      maxCombo: number,
      gameSettings: GameSettings
    ) => {
      // Calculate feedback for the trial that just ended
      const trialResponses = responses.get(currentTrial) || new Set<StimulusType>();
      const feedback = new Map<StimulusType, 'hit' | 'miss' | 'falseAlarm' | 'correctRejection'>();
      let anyCorrect = true;
      let anyWrong = false;

      for (const type of gameSettings.activeStimuli) {
        const wasMatch = isMatch(sequence, currentTrial, gameSettings.nLevel, type);
        const playerResponded = trialResponses.has(type);

        if (wasMatch && playerResponded) {
          feedback.set(type, 'hit');
        } else if (wasMatch && !playerResponded) {
          feedback.set(type, 'miss');
          anyCorrect = false;
          anyWrong = true;
        } else if (!wasMatch && playerResponded) {
          feedback.set(type, 'falseAlarm');
          anyCorrect = false;
          anyWrong = true;
        } else {
          feedback.set(type, 'correctRejection');
        }
      }

      // Update combo
      let newCombo = combo;
      if (currentTrial >= gameSettings.nLevel) {
        if (!anyWrong && anyCorrect) {
          newCombo = combo + 1;
        } else if (anyWrong) {
          newCombo = 0;
        }
      }
      const newMaxCombo = Math.max(maxCombo, newCombo);

      // Fire callback
      onTrialAdvance?.(feedback);

      const nextTrial = currentTrial + 1;

      if (nextTrial >= sequence.length) {
        // Game over
        cleanup();
        const finalResults = calculateResults(sequence, responses, gameSettings.nLevel, gameSettings.activeStimuli);
        const score = calculateOverallScore(finalResults);
        const xp = calculateXP(gameSettings.nLevel, score, newMaxCombo);

        setResults(finalResults);
        setOverallScore(score);
        setXpEarned(xp);
        setGameState((prev) => ({
          ...prev,
          phase: 'results',
          combo: newCombo,
          maxCombo: newMaxCombo,
          trialFeedback: feedback,
        }));
        return;
      }

      // Show feedback briefly, then advance
      setGameState((prev) => ({
        ...prev,
        phase: 'feedback',
        combo: newCombo,
        maxCombo: newMaxCombo,
        feedbackType: anyWrong ? 'incorrect' : anyCorrect ? 'correct' : null,
        trialFeedback: feedback,
      }));

      respondedThisTrialRef.current = new Set();

      // After feedback, show next trial
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          phase: 'playing',
          currentTrial: nextTrial,
          feedbackType: null,
          trialFeedback: null,
        }));

        // Schedule next advance
        timerRef.current = setTimeout(() => {
          setGameState((current) => {
            advanceTrial(nextTrial, sequence, current.responses, current.combo, current.maxCombo, gameSettings);
            return current;
          });
        }, gameSettings.intervalMs);
      }, 300);
    },
    [cleanup, onTrialAdvance]
  );

  const startGame = useCallback(
    (gameSettings: GameSettings) => {
      cleanup();
      setSettings(gameSettings);
      setResults(null);
      setOverallScore(0);
      setXpEarned(0);
      respondedThisTrialRef.current = new Set();

      const sequence = generateSequence(
        gameSettings.trialCount,
        gameSettings.nLevel,
        gameSettings.activeStimuli
      );

      // Countdown phase
      setCountdown(COUNTDOWN_SECONDS);
      setGameState({
        phase: 'countdown',
        currentTrial: 0,
        sequence,
        responses: new Map(),
        combo: 0,
        maxCombo: 0,
        feedbackType: null,
        trialFeedback: null,
      });

      let count = COUNTDOWN_SECONDS;
      countdownRef.current = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;

          // Start playing
          setGameState((prev) => ({
            ...prev,
            phase: 'playing',
          }));

          // Schedule first advance
          timerRef.current = setTimeout(() => {
            setGameState((current) => {
              advanceTrial(0, sequence, current.responses, current.combo, current.maxCombo, gameSettings);
              return current;
            });
          }, gameSettings.intervalMs);
        }
      }, 1000);
    },
    [cleanup, advanceTrial]
  );

  const respondMatch = useCallback(
    (type: StimulusType) => {
      if (gameState.phase !== 'playing') return;
      if (respondedThisTrialRef.current.has(type)) return;

      respondedThisTrialRef.current.add(type);

      setGameState((prev) => {
        const newResponses = new Map(prev.responses);
        const trialResponses = new Set(newResponses.get(prev.currentTrial) || []);
        trialResponses.add(type);
        newResponses.set(prev.currentTrial, trialResponses);

        return {
          ...prev,
          responses: newResponses,
        };
      });
    },
    [gameState.phase]
  );

  const currentStimulus = gameState.phase === 'playing' || gameState.phase === 'feedback'
    ? gameState.sequence[gameState.currentTrial] || null
    : null;

  return {
    gameState,
    startGame,
    respondMatch,
    currentStimulus,
    settings,
    results,
    overallScore,
    xpEarned,
    countdown,
  };
}
