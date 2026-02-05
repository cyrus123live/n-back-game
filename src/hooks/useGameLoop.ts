import { useState, useCallback, useRef, useEffect } from 'react';
import type { StimulusType, GameSettings, GameState, TrialStimulus, SessionResults, AdaptiveLevelChange } from '../types';
import { generateSequence, generateTrials, isMatch } from '../lib/sequence';
import { calculateResults, calculateAdaptiveResults, calculateOverallScore, calculateXP } from '../lib/scoring';

const COUNTDOWN_SECONDS = 3;

interface AdaptiveData {
  adaptive: boolean;
  startingLevel: number;
  endingLevel: number;
  levelChanges: AdaptiveLevelChange[];
}

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
  adaptiveLevel: number;
  adaptiveData: AdaptiveData | null;
  levelChangeNotification: { level: number; direction: 'up' | 'down' } | null;
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
  const [adaptiveLevel, setAdaptiveLevel] = useState(2);
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveData | null>(null);
  const [levelChangeNotification, setLevelChangeNotification] = useState<{ level: number; direction: 'up' | 'down' } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const respondedThisTrialRef = useRef<Set<StimulusType>>(new Set());
  const trialNLevelsRef = useRef<number[]>([]);
  const levelChangesRef = useRef<AdaptiveLevelChange[]>([]);
  const adaptiveLevelRef = useRef<number>(2);
  const blockStartRef = useRef<number>(0);

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
      // Use per-trial n-level for adaptive mode
      const currentNLevel = gameSettings.adaptive
        ? trialNLevelsRef.current[currentTrial]
        : gameSettings.nLevel;

      // Calculate feedback for the trial that just ended
      const trialResponses = responses.get(currentTrial) || new Set<StimulusType>();
      const feedback = new Map<StimulusType, 'hit' | 'miss' | 'falseAlarm' | 'correctRejection'>();
      let anyCorrect = true;
      let anyWrong = false;

      for (const type of gameSettings.activeStimuli) {
        const wasMatch = isMatch(sequence, currentTrial, currentNLevel, type);
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
      if (currentTrial >= currentNLevel) {
        if (!anyWrong && anyCorrect) {
          newCombo = combo + 1;
        } else if (anyWrong) {
          newCombo = 0;
        }
      }
      const newMaxCombo = Math.max(maxCombo, newCombo);

      // Fire callback
      onTrialAdvance?.(feedback);

      // Adaptive: check if block is complete
      let updatedSequence = sequence;
      if (gameSettings.adaptive && currentTrial >= currentNLevel) {
        const blockSize = adaptiveLevelRef.current;
        const scorableTrialsInBlock = currentTrial - blockStartRef.current + 1;

        if (scorableTrialsInBlock >= blockSize) {
          // Calculate block accuracy
          let blockHits = 0;
          let blockTotal = 0;
          for (let i = blockStartRef.current; i <= currentTrial; i++) {
            const trialN = trialNLevelsRef.current[i];
            if (i < trialN) continue;
            for (const type of gameSettings.activeStimuli) {
              const wasMatch = isMatch(sequence, i, trialN, type);
              const responded = responses.get(i)?.has(type) ?? false;
              if (wasMatch || responded) {
                blockTotal++;
                if (wasMatch && responded) blockHits++;
              }
            }
          }

          const blockAccuracy = blockTotal > 0 ? blockHits / blockTotal : 0;
          const oldLevel = adaptiveLevelRef.current;
          let newLevel = oldLevel;

          if (blockAccuracy >= 0.85 && oldLevel < 9) {
            newLevel = oldLevel + 1;
          } else if (blockAccuracy <= 0.5 && oldLevel > 1) {
            newLevel = oldLevel - 1;
          }

          if (newLevel !== oldLevel) {
            adaptiveLevelRef.current = newLevel;
            setAdaptiveLevel(newLevel);
            levelChangesRef.current.push({
              trial: currentTrial,
              fromLevel: oldLevel,
              toLevel: newLevel,
            });

            // Show notification
            setLevelChangeNotification({
              level: newLevel,
              direction: newLevel > oldLevel ? 'up' : 'down',
            });
            setTimeout(() => setLevelChangeNotification(null), 2000);

            // Regenerate remaining trials
            const nextTrial = currentTrial + 1;
            const remaining = gameSettings.trialCount - nextTrial;
            if (remaining > 0) {
              const kept = sequence.slice(0, nextTrial);
              const newTrials = generateTrials(
                kept,
                nextTrial,
                remaining,
                newLevel,
                gameSettings.activeStimuli
              );
              updatedSequence = [...kept, ...newTrials];

              // Update trialNLevels for new trials
              for (let i = nextTrial; i < gameSettings.trialCount; i++) {
                trialNLevelsRef.current[i] = newLevel;
              }
            }
          }

          blockStartRef.current = currentTrial + 1;
        }
      }

      const nextTrial = currentTrial + 1;

      if (nextTrial >= updatedSequence.length) {
        // Game over
        cleanup();

        let finalResults: SessionResults;
        let effectiveNLevel: number;
        if (gameSettings.adaptive) {
          finalResults = calculateAdaptiveResults(updatedSequence, responses, trialNLevelsRef.current, gameSettings.activeStimuli);
          effectiveNLevel = adaptiveLevelRef.current;
          setAdaptiveData({
            adaptive: true,
            startingLevel: gameSettings.nLevel,
            endingLevel: effectiveNLevel,
            levelChanges: [...levelChangesRef.current],
          });
        } else {
          finalResults = calculateResults(updatedSequence, responses, gameSettings.nLevel, gameSettings.activeStimuli);
          effectiveNLevel = gameSettings.nLevel;
        }

        const score = calculateOverallScore(finalResults);
        const xp = calculateXP(effectiveNLevel, score, newMaxCombo);

        setResults(finalResults);
        setOverallScore(score);
        setXpEarned(xp);
        setGameState((prev) => ({
          ...prev,
          phase: 'results',
          combo: newCombo,
          maxCombo: newMaxCombo,
          trialFeedback: feedback,
          sequence: updatedSequence,
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
        sequence: updatedSequence,
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
            advanceTrial(nextTrial, current.sequence, current.responses, current.combo, current.maxCombo, gameSettings);
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
      setAdaptiveData(null);
      setLevelChangeNotification(null);
      respondedThisTrialRef.current = new Set();

      // Initialize adaptive state
      if (gameSettings.adaptive) {
        adaptiveLevelRef.current = gameSettings.nLevel;
        setAdaptiveLevel(gameSettings.nLevel);
        trialNLevelsRef.current = new Array(gameSettings.trialCount).fill(gameSettings.nLevel);
        levelChangesRef.current = [];
        blockStartRef.current = gameSettings.nLevel; // First scorable trial
      }

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
    adaptiveLevel,
    adaptiveData,
    levelChangeNotification,
  };
}
