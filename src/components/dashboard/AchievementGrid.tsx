import type { UserAchievement } from '../../types';
import { getAchievementsWithStatus } from '../../lib/achievements';
import { AchievementIcon } from '../icons/AchievementIcon';

const CATEGORY_ORDER = ['sessions', 'streaks', 'performance', 'combo', 'level', 'modes'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  sessions: 'Sessions',
  streaks: 'Streaks',
  performance: 'Performance',
  combo: 'Combo',
  level: 'Level',
  modes: 'Modes',
};

interface AchievementGridProps {
  userAchievements: UserAchievement[];
}

export function AchievementGrid({ userAchievements }: AchievementGridProps) {
  const achievements = getAchievementsWithStatus(userAchievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: achievements.filter((a) => a.category === cat),
  }));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-text-muted font-medium uppercase tracking-wider">Achievements</h3>
        <span className="text-xs text-text-muted">
          {unlockedCount} / {achievements.length}
        </span>
      </div>
      <div className="space-y-3">
        {grouped.map((group) => (
          <div key={group.category}>
            <div className="text-xs text-text-muted mb-1.5">{group.label}</div>
            <div className="flex gap-2">
              {group.items.map((a) => (
                <div
                  key={a.id}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-xl
                    transition-all
                    ${a.unlocked
                      ? 'bg-secondary-surface hover:bg-card-border/50'
                      : 'bg-secondary-surface opacity-40 grayscale'
                    }
                  `}
                  title={`${a.name}: ${a.description}${a.unlocked ? ' (Unlocked!)' : ''}`}
                >
                  <AchievementIcon category={a.category} className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
