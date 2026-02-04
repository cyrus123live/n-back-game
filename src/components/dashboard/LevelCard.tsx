import { getRank } from '../../lib/constants';

interface LevelCardProps {
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
}

export function LevelCard({ level, xp, currentLevelXp, nextLevelXp }: LevelCardProps) {
  const rank = getRank(level);
  const progress = nextLevelXp > 0 ? (currentLevelXp / nextLevelXp) * 100 : 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-400">Level</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black" style={{ color: rank.color }}>
              {level}
            </span>
            <span className="text-sm font-semibold" style={{ color: rank.color }}>
              {rank.name}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total XP</div>
          <div className="text-lg font-bold text-yellow-400">{xp.toLocaleString()}</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-1">
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: rank.color,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{currentLevelXp} XP</span>
          <span>{nextLevelXp} XP to next level</span>
        </div>
      </div>
    </div>
  );
}
