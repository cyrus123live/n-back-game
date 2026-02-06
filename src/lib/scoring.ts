import type { StimulusType, TrialStimulus, SessionResults, TrialResult } from '../types';
import { isMatch } from './sequence';

export function calculateResults(
  sequence: TrialStimulus[],
  responses: Map<number, Set<StimulusType>>,
  nLevel: number,
  activeStimuli: StimulusType[]
): SessionResults {
  const results: SessionResults = {};

  for (const type of activeStimuli) {
    const result: TrialResult = { hits: 0, misses: 0, falseAlarms: 0 };

    for (let i = nLevel; i < sequence.length; i++) {
      const wasMatch = isMatch(sequence, i, nLevel, type);
      const playerResponded = responses.get(i)?.has(type) ?? false;

      if (wasMatch && playerResponded) {
        result.hits++;
      } else if (wasMatch && !playerResponded) {
        result.misses++;
      } else if (!wasMatch && playerResponded) {
        result.falseAlarms++;
      }
      // correct rejection: !wasMatch && !playerResponded (not tracked)
    }

    results[type] = result;
  }

  return results;
}

export function calculateAdaptiveResults(
  sequence: TrialStimulus[],
  responses: Map<number, Set<StimulusType>>,
  trialNLevels: number[],
  activeStimuli: StimulusType[]
): SessionResults {
  const results: SessionResults = {};

  for (const type of activeStimuli) {
    const result: TrialResult = { hits: 0, misses: 0, falseAlarms: 0 };

    for (let i = 0; i < sequence.length; i++) {
      const nLevel = trialNLevels[i];
      if (i < nLevel) continue; // Not scorable

      const wasMatch = isMatch(sequence, i, nLevel, type);
      const playerResponded = responses.get(i)?.has(type) ?? false;

      if (wasMatch && playerResponded) {
        result.hits++;
      } else if (wasMatch && !playerResponded) {
        result.misses++;
      } else if (!wasMatch && playerResponded) {
        result.falseAlarms++;
      }
    }

    results[type] = result;
  }

  return results;
}

export function calculateAccuracy(result: TrialResult): number {
  const total = result.hits + result.misses + result.falseAlarms;
  if (total === 0) return 1;
  return result.hits / total;
}

export function calculateOverallScore(results: SessionResults): number {
  const types = Object.keys(results);
  if (types.length === 0) return 0;

  let totalAccuracy = 0;
  for (const type of types) {
    totalAccuracy += calculateAccuracy(results[type]);
  }
  return totalAccuracy / types.length;
}

export function calculateXP(
  nLevel: number,
  overallScore: number,
  maxCombo: number,
): number {
  // Base XP = nLevel * 10 * accuracy
  const baseXP = nLevel * 10 * overallScore;

  // Combo multiplier: max 2x at 10+ combo
  const comboMultiplier = 1 + Math.min(maxCombo, 10) * 0.1;

  return Math.round(baseXP * comboMultiplier);
}

export function getComboColor(combo: number): string {
  if (combo >= 15) return 'combo-gold';
  if (combo >= 10) return 'combo-purple';
  if (combo >= 5) return 'combo-blue';
  return 'text-text-secondary';
}

export function getComboGlow(_combo: number): string {
  return '';
}
