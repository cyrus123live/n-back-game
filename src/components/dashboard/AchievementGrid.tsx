import type { UserAchievement } from '../../types';
import { getAchievementsWithStatus } from '../../lib/achievements';

interface AchievementGridProps {
  userAchievements: UserAchievement[];
}

export function AchievementGrid({ userAchievements }: AchievementGridProps) {
  const achievements = getAchievementsWithStatus(userAchievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Achievements</h3>
        <span className="text-xs text-gray-500">
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
                ? 'bg-gray-700/50 hover:bg-gray-700'
                : 'bg-gray-800/30 opacity-30 grayscale'
              }
            `}
            title={`${a.name}: ${a.description}${a.unlocked ? ' (Unlocked!)' : ''}`}
          >
            <span className="text-2xl">{a.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
