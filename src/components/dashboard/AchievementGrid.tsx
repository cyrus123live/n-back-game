import type { UserAchievement } from '../../types';
import { getAchievementsWithStatus } from '../../lib/achievements';
import { AchievementIcon } from '../icons/AchievementIcon';

interface AchievementGridProps {
  userAchievements: UserAchievement[];
}

export function AchievementGrid({ userAchievements }: AchievementGridProps) {
  const achievements = getAchievementsWithStatus(userAchievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-text-muted font-medium uppercase tracking-wider">Achievements</h3>
        <span className="text-xs text-text-muted">
          {unlockedCount} / {achievements.length}
        </span>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`
              relative flex items-center justify-center w-12 h-12 rounded-xl
              transition-all
              ${a.unlocked
                ? 'bg-secondary-surface hover:bg-card-border/50'
                : 'bg-secondary-surface opacity-40 grayscale'
              }
            `}
            title={`${a.name}: ${a.description}${a.unlocked ? ' (Unlocked!)' : ''}`}
          >
            <AchievementIcon category={a.category} className="w-6 h-6" />
          </div>
        ))}
      </div>
    </div>
  );
}
