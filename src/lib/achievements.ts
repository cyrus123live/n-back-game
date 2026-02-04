import { ACHIEVEMENTS, getAchievementDef } from './constants';
import type { AchievementDef, UserAchievement } from '../types';

export interface AchievementDisplayInfo extends AchievementDef {
  unlocked: boolean;
  unlockedAt?: string;
}

export function getAchievementsWithStatus(
  userAchievements: UserAchievement[]
): AchievementDisplayInfo[] {
  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  return ACHIEVEMENTS.map((def) => ({
    ...def,
    unlocked: unlockedMap.has(def.id),
    unlockedAt: unlockedMap.get(def.id),
  }));
}

export function getNewlyUnlockedAchievements(
  achievementIds: string[]
): AchievementDef[] {
  return achievementIds
    .map((id) => getAchievementDef(id))
    .filter((a): a is AchievementDef => a !== undefined);
}
