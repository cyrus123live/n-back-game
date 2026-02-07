import type { TrialStimulus, StimulusType } from '../types';

// Pre-scripted 2-back sequence with position + color
// Guided section (trials 0-4):
// - Trial 2: position match (same pos as trial 0)
// - Trial 3: no match
// - Trial 4: color match (same color as trial 2)
// Free practice (trials 5-14): mix of position, color, both, and no-match

export const TUTORIAL_N_LEVEL = 2;
export const TUTORIAL_STIMULI: StimulusType[] = ['position', 'color'];

export const TUTORIAL_SEQUENCE: TrialStimulus[] = [
  // === GUIDED SECTION ===
  // Trial 0: Position 0 (top-left), blue
  { position: 0, color: '#3b82f6', shape: 'circle', number: 1, audio: 'B' },
  // Trial 1: Position 4 (center), green
  { position: 4, color: '#22c55e', shape: 'square', number: 2, audio: 'K' },
  // Trial 2: Position 0 (top-left) = POSITION MATCH with trial 0, red
  { position: 0, color: '#ef4444', shape: 'triangle', number: 3, audio: 'D' },
  // Trial 3: Position 8 (bottom-right), yellow - NO MATCH
  { position: 8, color: '#eab308', shape: 'diamond', number: 4, audio: 'M' },
  // Trial 4: Position 3 (middle-left), red = COLOR MATCH with trial 2
  { position: 3, color: '#ef4444', shape: 'star', number: 5, audio: 'D' },
  // === FREE PRACTICE ===
  // Trial 5: Position 8 (bottom-right) = POSITION MATCH with trial 3, purple
  { position: 8, color: '#a855f7', shape: 'hexagon', number: 6, audio: 'F' },
  // Trial 6: Position 7 (bottom-center), red = COLOR MATCH with trial 4
  { position: 7, color: '#ef4444', shape: 'circle', number: 7, audio: 'D' },
  // Trial 7: Position 2 (top-right), teal - NO MATCH
  { position: 2, color: '#14b8a6', shape: 'square', number: 8, audio: 'G' },
  // Trial 8: Position 7 (bottom-center) = POSITION MATCH with trial 6, blue - NO COLOR MATCH
  { position: 7, color: '#3b82f6', shape: 'diamond', number: 9, audio: 'B' },
  // Trial 9: Position 6 (bottom-left), teal = COLOR MATCH with trial 7 - NO POS MATCH
  { position: 6, color: '#14b8a6', shape: 'star', number: 1, audio: 'K' },
  // Trial 10: Position 7 = POSITION MATCH with trial 8, orange - NO COLOR MATCH
  { position: 7, color: '#f97316', shape: 'triangle', number: 2, audio: 'D' },
  // Trial 11: Position 1 (top-center), green - NO MATCH
  { position: 1, color: '#22c55e', shape: 'hexagon', number: 3, audio: 'M' },
  // Trial 12: Position 7 = POSITION MATCH with trial 10, orange = COLOR MATCH with trial 10 (BOTH!)
  { position: 7, color: '#f97316', shape: 'circle', number: 4, audio: 'F' },
  // Trial 13: Position 5 (middle-right), purple - NO MATCH
  { position: 5, color: '#a855f7', shape: 'square', number: 5, audio: 'G' },
  // Trial 14: Position 7 = POSITION MATCH with trial 12, blue - NO COLOR MATCH
  { position: 7, color: '#3b82f6', shape: 'diamond', number: 6, audio: 'B' },
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
    message: 'Notice the position on the grid and the color of the square. You\'ll need to remember these for later comparison.',
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
    message: 'This one doesn\'t match anything from 2 trials ago - different position and different color. When there\'s no match, simply wait for the next trial.',
    highlight: 'grid',
  },
  {
    trialIndex: 4,
    phase: 'during',
    title: 'Color Match!',
    message: 'The color red also appeared 2 trials ago! Tap Color to mark the color match.',
    waitForKey: 'color',
    highlight: 'buttons',
  },
  {
    trialIndex: 5,
    phase: 'before',
    title: 'Free Practice',
    message: 'Now try on your own for the next 10 trials. Look for position and color matches from 2 trials back. The grid will flash green when you\'re correct.',
  },
];
