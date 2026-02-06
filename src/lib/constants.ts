import type { AchievementDef } from '../types';

export const GRID_POSITIONS = 9; // 3x3

export const COLORS = [
  '#c45c4e', // red
  '#577fb5', // blue
  '#538d4e', // green
  '#c4a035', // yellow
  '#8b6eae', // purple
  '#c47a3e', // orange
  '#4a9ea8', // cyan
  '#b5648a', // pink
];

export const SHAPES = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'star',
  'hexagon',
  'cross',
  'pentagon',
];

export const LETTERS = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T'];

export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const RANK_TIERS = [
  { name: 'Novice', minLevel: 1, color: '#787774' },
  { name: 'Apprentice', minLevel: 5, color: '#538d4e' },
  { name: 'Adept', minLevel: 10, color: '#577fb5' },
  { name: 'Expert', minLevel: 15, color: '#8b6eae' },
  { name: 'Master', minLevel: 20, color: '#c4a035' },
  { name: 'Grandmaster', minLevel: 25, color: '#b85c4e' },
];

export function getRank(level: number) {
  let rank = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel) rank = tier;
  }
  return rank;
}

export function getLevelThresholds(): number[] {
  const thresholds = [0];
  let threshold = 0;
  for (let i = 1; i <= 50; i++) {
    threshold += 100 + (i - 1) * 50;
    thresholds.push(threshold);
  }
  return thresholds;
}

export const STIMULUS_LABELS: Record<string, string> = {
  position: 'Position',
  color: 'Color',
  shape: 'Shape',
  number: 'Number',
  audio: 'Audio',
};

export const STIMULUS_COLORS: Record<string, string> = {
  position: '#577fb5',
  color: '#4a9ea8',
  shape: '#8b6eae',
  number: '#c4a035',
  audio: '#b85c4e',
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // Sessions
  { id: 'first_steps', name: 'First Steps', description: 'Complete your first session', category: 'sessions' },
  { id: 'brain_warm', name: 'Brain Warm-Up', description: 'Complete 5 sessions', category: 'sessions' },
  { id: 'getting_warmed_up', name: 'Getting Warmed Up', description: 'Complete 10 sessions', category: 'sessions' },
  { id: 'marathon', name: 'Marathon Runner', description: 'Complete 50 sessions', category: 'sessions' },
  { id: 'centurion', name: 'Centurion', description: 'Complete 100 sessions', category: 'sessions' },

  // Streaks
  { id: 'dedicated_7', name: 'Dedicated', description: '7-day streak', category: 'streaks' },
  { id: 'committed_14', name: 'Committed', description: '14-day streak', category: 'streaks' },
  { id: 'unstoppable_30', name: 'Unstoppable', description: '30-day streak', category: 'streaks' },
  { id: 'legendary_60', name: 'Legendary', description: '60-day streak', category: 'streaks' },
  { id: 'immortal_100', name: 'Immortal', description: '100-day streak', category: 'streaks' },

  // Performance
  { id: 'sharp_mind', name: 'Sharp Mind', description: '90%+ accuracy on 3-back', category: 'performance' },
  { id: 'high_scorer', name: 'High Scorer', description: '95%+ accuracy on 2+ back', category: 'performance' },
  { id: 'perfectionist', name: 'Perfectionist', description: '100% accuracy on any round', category: 'performance' },

  // Combo
  { id: 'combo_starter', name: 'Combo Starter', description: 'Reach 5 combo', category: 'combo' },
  { id: 'combo_master', name: 'Combo Master', description: 'Reach 10 combo', category: 'combo' },
  { id: 'combo_king', name: 'Combo King', description: 'Reach 15 combo', category: 'combo' },
  { id: 'combo_legend', name: 'Combo Legend', description: 'Reach 20 combo', category: 'combo' },

  // Level
  { id: 'level_5', name: 'Level Up', description: 'Reach level 5', category: 'level' },
  { id: 'level_10', name: 'Double Digits', description: 'Reach level 10', category: 'level' },
  { id: 'level_15', name: 'Rising Star', description: 'Reach level 15', category: 'level' },
  { id: 'level_20', name: 'Elite', description: 'Reach level 20', category: 'level' },
  { id: 'grandmaster', name: 'Grandmaster', description: 'Reach level 25', category: 'level' },
  { id: 'xp_hunter', name: 'XP Hunter', description: 'Earn 1000 total XP', category: 'level' },

  // Modes
  { id: 'dual_mode', name: 'Dual Mode', description: 'Play with 2 stimulus types', category: 'modes' },
  { id: 'triple_mode', name: 'Triple Mode', description: 'Play with 3 stimulus types', category: 'modes' },
  { id: 'quad_mode', name: 'Quad Mode', description: 'Play with 4 stimulus types', category: 'modes' },
  { id: 'quintuple_threat', name: 'Quintuple Threat', description: 'Play with all 5 stimulus types', category: 'modes' },
  { id: 'triple_threat', name: 'Triple N-Back', description: 'Play 3-back or higher', category: 'modes' },
  { id: 'quad_core', name: 'Quad Core', description: 'Play 4-back or higher', category: 'modes' },
  { id: 'five_back', name: 'Five Back', description: 'Play 5-back or higher', category: 'modes' },
];

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
