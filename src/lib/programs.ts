import type { StimulusType } from '../types';

export interface ProgramSession {
  day: number;
  nLevel: number;
  activeStimuli: StimulusType[];
  trialCount: number;
  intervalMs: number;
  description: string;
  adaptive?: boolean;
  requiredScore?: number;
}

export const DEFAULT_REQUIRED_SCORE = 0.7;
export const SKIP_THRESHOLD = 0.9;

export function getRequiredScore(session: ProgramSession): number {
  return session.requiredScore ?? DEFAULT_REQUIRED_SCORE;
}

export interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalDays: number;
  sessions: ProgramSession[];
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: 'beginner',
    name: 'Beginner Foundation',
    description: 'Build your working memory from the ground up. Start with 2-back dual stimuli and work up to 3-back.',
    difficulty: 'beginner',
    totalDays: 20,
    sessions: [
      { day: 1, nLevel: 2, activeStimuli: ['position', 'color'], trialCount: 20, intervalMs: 3000, description: 'Introduction: 2-back with position + color at a relaxed pace' },
      { day: 2, nLevel: 2, activeStimuli: ['position', 'color'], trialCount: 20, intervalMs: 3000, description: 'Practice: Same setup, build confidence' },
      { day: 3, nLevel: 2, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 3000, description: 'Extend: More trials for endurance' },
      { day: 4, nLevel: 2, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 2500, description: 'Speed up: Faster interval' },
      { day: 5, nLevel: 2, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 2500, description: 'Consolidate at 2.5s pace' },
      { day: 6, nLevel: 2, activeStimuli: ['position', 'color', 'shape'], trialCount: 20, intervalMs: 3000, description: 'Add shape: Triple stimuli at relaxed pace' },
      { day: 7, nLevel: 2, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 3000, description: 'Practice: Triple stimuli' },
      { day: 8, nLevel: 2, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Speed up triple stimuli' },
      { day: 9, nLevel: 2, activeStimuli: ['position', 'color', 'shape'], trialCount: 30, intervalMs: 2500, description: 'Endurance: 30 trials' },
      { day: 10, nLevel: 2, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Checkpoint: Consolidate 2-back skills' },
      { day: 11, nLevel: 3, activeStimuli: ['position', 'color'], trialCount: 20, intervalMs: 3000, description: 'Level up: 3-back with dual stimuli' },
      { day: 12, nLevel: 3, activeStimuli: ['position', 'color'], trialCount: 20, intervalMs: 3000, description: 'Practice 3-back' },
      { day: 13, nLevel: 3, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 3000, description: 'Extend 3-back' },
      { day: 14, nLevel: 3, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 2500, description: 'Speed up 3-back' },
      { day: 15, nLevel: 3, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 2500, description: 'Consolidate 3-back' },
      { day: 16, nLevel: 3, activeStimuli: ['position', 'color', 'shape'], trialCount: 20, intervalMs: 3000, description: 'Triple 3-back: Add shape' },
      { day: 17, nLevel: 3, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 3000, description: 'Practice triple 3-back' },
      { day: 18, nLevel: 3, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Speed up triple 3-back' },
      { day: 19, nLevel: 3, activeStimuli: ['position', 'color', 'shape'], trialCount: 30, intervalMs: 2500, description: 'Endurance: 30 trials of triple 3-back' },
      { day: 20, nLevel: 3, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Final: Prove your 3-back mastery' },
    ],
  },
  {
    id: 'intermediate',
    name: 'Intermediate Builder',
    description: 'Push from 3-back to 4-back while adding stimulus complexity.',
    difficulty: 'intermediate',
    totalDays: 20,
    sessions: [
      { day: 1, nLevel: 3, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 2500, description: 'Warm-up: 3-back dual' },
      { day: 2, nLevel: 3, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Add shape to 3-back' },
      { day: 3, nLevel: 3, activeStimuli: ['position', 'color', 'shape'], trialCount: 30, intervalMs: 2500, description: 'Endurance: 30 trials triple 3-back' },
      { day: 4, nLevel: 3, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 3000, description: 'Quad stimuli 3-back' },
      { day: 5, nLevel: 3, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, description: 'Speed up quad 3-back' },
      { day: 6, nLevel: 3, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2500, description: 'Endurance quad 3-back' },
      { day: 7, nLevel: 3, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, adaptive: true, description: 'Adaptive: Let the system challenge you' },
      { day: 8, nLevel: 4, activeStimuli: ['position', 'color'], trialCount: 20, intervalMs: 3000, description: 'Level up: 4-back dual' },
      { day: 9, nLevel: 4, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 3000, description: 'Practice 4-back dual' },
      { day: 10, nLevel: 4, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 2500, description: 'Speed up 4-back dual' },
      { day: 11, nLevel: 4, activeStimuli: ['position', 'color'], trialCount: 30, intervalMs: 2500, description: 'Endurance 4-back dual' },
      { day: 12, nLevel: 4, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 3000, description: 'Triple 4-back' },
      { day: 13, nLevel: 4, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Speed up triple 4-back' },
      { day: 14, nLevel: 4, activeStimuli: ['position', 'color', 'shape'], trialCount: 30, intervalMs: 2500, description: 'Endurance triple 4-back' },
      { day: 15, nLevel: 4, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, adaptive: true, description: 'Adaptive triple challenge' },
      { day: 16, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 3000, description: 'Quad 4-back' },
      { day: 17, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, description: 'Speed up quad 4-back' },
      { day: 18, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2500, description: 'Endurance quad 4-back' },
      { day: 19, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, adaptive: true, description: 'Adaptive quad challenge' },
      { day: 20, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2500, description: 'Final: Prove your 4-back mastery' },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced Mastery',
    description: 'Master 4-back and push into 5-back+ with up to 4 stimulus types.',
    difficulty: 'advanced',
    totalDays: 20,
    sessions: [
      { day: 1, nLevel: 4, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Warm-up: 4-back triple' },
      { day: 2, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, description: 'Quad 4-back' },
      { day: 3, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, description: 'Practice quad 4-back' },
      { day: 4, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2500, description: 'Endurance quad 4-back' },
      { day: 5, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, adaptive: true, description: 'Adaptive quad 4-back' },
      { day: 6, nLevel: 4, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2000, description: 'Sprint: Fast quad 4-back' },
      { day: 7, nLevel: 5, activeStimuli: ['position', 'color'], trialCount: 20, intervalMs: 3000, description: 'Level up: 5-back dual' },
      { day: 8, nLevel: 5, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 3000, description: 'Practice 5-back dual' },
      { day: 9, nLevel: 5, activeStimuli: ['position', 'color'], trialCount: 25, intervalMs: 2500, description: 'Speed up 5-back dual' },
      { day: 10, nLevel: 5, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 3000, description: 'Triple 5-back' },
      { day: 11, nLevel: 5, activeStimuli: ['position', 'color', 'shape'], trialCount: 25, intervalMs: 2500, description: 'Speed up triple 5-back' },
      { day: 12, nLevel: 5, activeStimuli: ['position', 'color', 'shape'], trialCount: 30, intervalMs: 2500, description: 'Endurance triple 5-back' },
      { day: 13, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 3000, description: 'Quad 5-back' },
      { day: 14, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, description: 'Speed up quad 5-back' },
      { day: 15, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2500, description: 'Endurance quad 5-back' },
      { day: 16, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2500, adaptive: true, description: 'Adaptive quad 5-back' },
      { day: 17, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2000, description: 'Sprint: Fast quad 5-back' },
      { day: 18, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2500, description: 'Endurance quad 5-back' },
      { day: 19, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 25, intervalMs: 2000, description: 'Sprint: Fast quad 5-back' },
      { day: 20, nLevel: 5, activeStimuli: ['position', 'color', 'shape', 'number'], trialCount: 30, intervalMs: 2500, adaptive: true, description: 'Final: Adaptive quad 5-back challenge' },
    ],
  },
];

export function getTemplate(id: string): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES.find((t) => t.id === id);
}
