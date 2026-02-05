import type { TrialStimulus, StimulusType } from '../types';

// Pre-scripted 2-back sequence with position + audio
// Designed so:
// - Trial 2: position match (same pos as trial 0)
// - Trial 3: no match
// - Trial 4: audio match (same letter as trial 2)
// - Trial 5-7: free practice with some matches

export const TUTORIAL_N_LEVEL = 2;
export const TUTORIAL_STIMULI: StimulusType[] = ['position', 'audio'];

export const TUTORIAL_SEQUENCE: TrialStimulus[] = [
  // Trial 0: Position 0 (top-left), letter B
  { position: 0, color: '#3b82f6', shape: 'circle', number: 1, audio: 'B' },
  // Trial 1: Position 4 (center), letter K
  { position: 4, color: '#22c55e', shape: 'square', number: 2, audio: 'K' },
  // Trial 2: Position 0 (top-left) = POSITION MATCH with trial 0, letter D
  { position: 0, color: '#ef4444', shape: 'triangle', number: 3, audio: 'D' },
  // Trial 3: Position 8 (bottom-right), letter M - NO MATCH
  { position: 8, color: '#eab308', shape: 'diamond', number: 4, audio: 'M' },
  // Trial 4: Position 3 (middle-left), letter D = AUDIO MATCH with trial 2
  { position: 3, color: '#a855f7', shape: 'star', number: 5, audio: 'D' },
  // Trial 5: Position 8 (bottom-right) = POSITION MATCH with trial 3, letter F
  { position: 8, color: '#3b82f6', shape: 'hexagon', number: 6, audio: 'F' },
  // Trial 6: Position 7 (bottom-center), letter D = AUDIO MATCH with trial 4
  { position: 7, color: '#22c55e', shape: 'circle', number: 7, audio: 'D' },
  // Trial 7: Position 2 (top-right), letter G - NO MATCH
  { position: 2, color: '#ef4444', shape: 'square', number: 8, audio: 'G' },
];

export interface TutorialStep {
  trialIndex: number;
  phase: 'before' | 'during';
  title: string;
  message: string;
  waitForKey?: StimulusType;
  highlight?: 'grid' | 'buttons' | 'progress';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    trialIndex: 0,
    phase: 'before',
    title: 'Welcome to N-Back!',
    message: 'In this task, you need to remember stimuli and identify when the current one matches what appeared N trials ago. We\'ll start with 2-back: you compare each trial to 2 trials before it.',
    highlight: 'grid',
  },
  {
    trialIndex: 0,
    phase: 'during',
    title: 'Watch and Remember',
    message: 'Notice the position on the grid and the letter you hear. You\'ll need to remember these for later comparison.',
    highlight: 'grid',
  },
  {
    trialIndex: 1,
    phase: 'during',
    title: 'Keep Watching',
    message: 'Another trial. The first 2 trials are just for building your memory - you can\'t match anything yet since there\'s nothing 2 trials back.',
    highlight: 'progress',
  },
  {
    trialIndex: 2,
    phase: 'during',
    title: 'Position Match!',
    message: 'This stimulus appeared in the same position as 2 trials ago (top-left). Tap the Position button to indicate a match!',
    waitForKey: 'position',
    highlight: 'buttons',
  },
  {
    trialIndex: 3,
    phase: 'during',
    title: 'No Match',
    message: 'This one doesn\'t match anything from 2 trials ago - different position and different letter. When there\'s no match, simply wait for the next trial.',
    highlight: 'grid',
  },
  {
    trialIndex: 4,
    phase: 'during',
    title: 'Audio Match!',
    message: 'The letter "D" was also played 2 trials ago! Tap Audio to mark the audio match.',
    waitForKey: 'audio',
    highlight: 'buttons',
  },
  {
    trialIndex: 5,
    phase: 'before',
    title: 'Free Practice',
    message: 'Now try on your own for the remaining trials. Look for position and audio matches from 2 trials back. Hints will appear if you need help.',
  },
];
