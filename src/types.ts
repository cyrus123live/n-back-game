export type StimulusType = 'position' | 'color' | 'shape' | 'number' | 'audio';

export interface GameSettings {
  nLevel: number;
  activeStimuli: StimulusType[];
  trialCount: number;
  intervalMs: number;
  adaptive?: boolean;
}

export interface AdaptiveLevelChange {
  trial: number;
  fromLevel: number;
  toLevel: number;
}

export interface TrialStimulus {
  position: number;    // 0-8 (3x3 grid)
  color: string;       // hex color
  shape: string;       // shape name
  number: number;      // 1-9
  audio: string;       // letter
}

export interface TrialResult {
  hits: number;
  misses: number;
  falseAlarms: number;
}

export interface SessionResults {
  [stimulusType: string]: TrialResult;
}

export interface GameState {
  phase: 'idle' | 'countdown' | 'playing' | 'feedback' | 'results';
  currentTrial: number;
  sequence: TrialStimulus[];
  responses: Map<number, Set<StimulusType>>;
  combo: number;
  maxCombo: number;
  feedbackType: 'correct' | 'incorrect' | 'miss' | null;
  trialFeedback: Map<StimulusType, 'hit' | 'miss' | 'falseAlarm' | 'correctRejection'> | null;
}

export interface UserProfile {
  id: string;
  clerkUserId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt: string | null;
  streakFreezes: number;
  currentLevelXp: number;
  nextLevelXp: number;
  streakBroken: boolean;
}

export interface SessionRecord {
  id: string;
  nLevel: number;
  activeStimuli: string[];
  trialCount: number;
  intervalMs: number;
  results: SessionResults;
  overallScore: number;
  xpEarned: number;
  maxCombo: number;
  adaptive?: boolean;
  startingLevel?: number;
  endingLevel?: number;
  levelChanges?: AdaptiveLevelChange[];
  createdAt: string;
}

export interface SessionSaveResponse {
  session: SessionRecord;
  xpEarned: number;
  isFirstPlayToday: boolean;
  newLevel: number;
  leveledUp: boolean;
  newStreak: number;
  newAchievements: string[];
  earnedFreeze: boolean;
}

export interface StatsData {
  totalSessions: number;
  scoreTrend: { date: string; score: number; nLevel: number }[];
  bestByLevel: Record<number, number>;
  heatmap: Record<string, { count: number; avgScore: number }>;
  avgByStimulus: Record<string, number>;
  highestNLevel: number;
}

export interface DailyChallenge {
  nLevel: number;
  activeStimuli: StimulusType[];
  trialCount: number;
  intervalMs: number;
  timeUntilNext: number;
  dateKey: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'sessions' | 'streaks' | 'performance' | 'combo' | 'level' | 'modes';
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
}

export interface TrainingProgramRecord {
  id: string;
  templateId: string;
  currentDay: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  completedSessions: string[];
}

export interface ProgramsResponse {
  programs: TrainingProgramRecord[];
}

export interface ProgramSessionResult {
  program: TrainingProgramRecord;
  completed: boolean;
  passed: boolean;
  skippedTo?: number;
  requiredScore: number;
}

export const KEY_MAP: Record<string, StimulusType> = {
  a: 'position',
  s: 'color',
  d: 'shape',
  j: 'number',
  l: 'audio',
};

export const STIMULUS_KEY_MAP: Record<StimulusType, string> = {
  position: 'a',
  color: 's',
  shape: 'd',
  number: 'j',
  audio: 'l',
};
