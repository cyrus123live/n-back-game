import type { StimulusType, TrialStimulus } from '../types';
import { COLORS, SHAPES, LETTERS, NUMBERS, GRID_POSITIONS } from './constants';

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFromExcluding<T>(arr: T[], exclude: T): T {
  const filtered = arr.filter((v) => v !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function generateSequence(
  trialCount: number,
  nLevel: number,
  activeStimuli: StimulusType[],
  matchRate: number = 0.33
): TrialStimulus[] {
  const sequence: TrialStimulus[] = [];

  // For each stimulus type, decide which trials will be matches
  const matchTrials: Record<StimulusType, Set<number>> = {
    position: new Set(),
    color: new Set(),
    shape: new Set(),
    number: new Set(),
    audio: new Set(),
  };

  // Only generate match patterns for active stimuli
  for (const type of activeStimuli) {
    for (let i = nLevel; i < trialCount; i++) {
      if (Math.random() < matchRate) {
        matchTrials[type].add(i);
      }
    }
  }

  // Generate the sequence
  for (let i = 0; i < trialCount; i++) {
    const stimulus: TrialStimulus = {
      position: Math.floor(Math.random() * GRID_POSITIONS),
      color: randomFrom(COLORS),
      shape: randomFrom(SHAPES),
      number: randomFrom(NUMBERS),
      audio: randomFrom(LETTERS),
    };

    // For each active stimulus type, enforce matches or non-matches
    if (i >= nLevel) {
      const nBackStimulus = sequence[i - nLevel];

      for (const type of activeStimuli) {
        if (matchTrials[type].has(i)) {
          // Force match with n-back trial
          switch (type) {
            case 'position':
              stimulus.position = nBackStimulus.position;
              break;
            case 'color':
              stimulus.color = nBackStimulus.color;
              break;
            case 'shape':
              stimulus.shape = nBackStimulus.shape;
              break;
            case 'number':
              stimulus.number = nBackStimulus.number;
              break;
            case 'audio':
              stimulus.audio = nBackStimulus.audio;
              break;
          }
        } else {
          // Force non-match
          switch (type) {
            case 'position':
              if (stimulus.position === nBackStimulus.position) {
                stimulus.position = (nBackStimulus.position + 1 + Math.floor(Math.random() * (GRID_POSITIONS - 1))) % GRID_POSITIONS;
              }
              break;
            case 'color':
              if (stimulus.color === nBackStimulus.color) {
                stimulus.color = randomFromExcluding(COLORS, nBackStimulus.color);
              }
              break;
            case 'shape':
              if (stimulus.shape === nBackStimulus.shape) {
                stimulus.shape = randomFromExcluding(SHAPES, nBackStimulus.shape);
              }
              break;
            case 'number':
              if (stimulus.number === nBackStimulus.number) {
                stimulus.number = randomFromExcluding(NUMBERS, nBackStimulus.number);
              }
              break;
            case 'audio':
              if (stimulus.audio === nBackStimulus.audio) {
                stimulus.audio = randomFromExcluding(LETTERS, nBackStimulus.audio);
              }
              break;
          }
        }
      }
    }

    sequence.push(stimulus);
  }

  return sequence;
}

/**
 * Generate trials for a section of the sequence with a given nLevel.
 * Uses the existing sequence as context for n-back references.
 */
export function generateTrials(
  existingSequence: TrialStimulus[],
  startIndex: number,
  count: number,
  nLevel: number,
  activeStimuli: StimulusType[],
  matchRate: number = 0.33
): TrialStimulus[] {
  const totalLength = startIndex + count;
  const newTrials: TrialStimulus[] = [];

  // Decide match patterns for new trials
  const matchTrials: Record<StimulusType, Set<number>> = {
    position: new Set(),
    color: new Set(),
    shape: new Set(),
    number: new Set(),
    audio: new Set(),
  };

  for (const type of activeStimuli) {
    for (let i = startIndex; i < totalLength; i++) {
      if (i >= nLevel && Math.random() < matchRate) {
        matchTrials[type].add(i);
      }
    }
  }

  // Build the combined sequence for reference
  const fullSequence = [...existingSequence];

  for (let i = startIndex; i < totalLength; i++) {
    const stimulus: TrialStimulus = {
      position: Math.floor(Math.random() * GRID_POSITIONS),
      color: randomFrom(COLORS),
      shape: randomFrom(SHAPES),
      number: randomFrom(NUMBERS),
      audio: randomFrom(LETTERS),
    };

    if (i >= nLevel) {
      const nBackStimulus = fullSequence[i - nLevel];

      for (const type of activeStimuli) {
        if (matchTrials[type].has(i)) {
          switch (type) {
            case 'position': stimulus.position = nBackStimulus.position; break;
            case 'color': stimulus.color = nBackStimulus.color; break;
            case 'shape': stimulus.shape = nBackStimulus.shape; break;
            case 'number': stimulus.number = nBackStimulus.number; break;
            case 'audio': stimulus.audio = nBackStimulus.audio; break;
          }
        } else {
          switch (type) {
            case 'position':
              if (stimulus.position === nBackStimulus.position) {
                stimulus.position = (nBackStimulus.position + 1 + Math.floor(Math.random() * (GRID_POSITIONS - 1))) % GRID_POSITIONS;
              }
              break;
            case 'color':
              if (stimulus.color === nBackStimulus.color) stimulus.color = randomFromExcluding(COLORS, nBackStimulus.color);
              break;
            case 'shape':
              if (stimulus.shape === nBackStimulus.shape) stimulus.shape = randomFromExcluding(SHAPES, nBackStimulus.shape);
              break;
            case 'number':
              if (stimulus.number === nBackStimulus.number) stimulus.number = randomFromExcluding(NUMBERS, nBackStimulus.number);
              break;
            case 'audio':
              if (stimulus.audio === nBackStimulus.audio) stimulus.audio = randomFromExcluding(LETTERS, nBackStimulus.audio);
              break;
          }
        }
      }
    }

    fullSequence.push(stimulus);
    newTrials.push(stimulus);
  }

  return newTrials;
}

export function isMatch(
  sequence: TrialStimulus[],
  trialIndex: number,
  nLevel: number,
  stimulusType: StimulusType
): boolean {
  if (trialIndex < nLevel) return false;
  const current = sequence[trialIndex];
  const nBack = sequence[trialIndex - nLevel];

  switch (stimulusType) {
    case 'position':
      return current.position === nBack.position;
    case 'color':
      return current.color === nBack.color;
    case 'shape':
      return current.shape === nBack.shape;
    case 'number':
      return current.number === nBack.number;
    case 'audio':
      return current.audio === nBack.audio;
  }
}
