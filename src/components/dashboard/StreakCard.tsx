import type { StatsData } from '../../types';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  heatmap: StatsData['heatmap'];
}

export function StreakCard({ currentStreak, longestStreak, streakFreezes, heatmap }: StreakCardProps) {
  // Build 12-week calendar grid
  const today = new Date();
  const weeks: { date: string; count: number; score: number }[][] = [];

  for (let w = 11; w >= 0; w--) {
    const week: { date: string; count: number; score: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - w * 7 - (6 - d));
      // Align to start of week (Sunday)
      const dayOfWeek = today.getDay();
      date.setDate(date.getDate() - dayOfWeek + d - 7 * (11 - w));

      // Recalculate properly
      const daysAgo = w * 7 + (6 - d);
      const cellDate = new Date(today);
      cellDate.setDate(cellDate.getDate() - daysAgo);
      const dateKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      const data = heatmap[dateKey];

      week.push({
        date: dateKey,
        count: data?.count || 0,
        score: data?.avgScore || 0,
      });
    }
    weeks.push(week);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400">Current Streak</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-orange-400">{currentStreak}</span>
            <span className="text-xl">🔥</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Longest: {longestStreak} days</div>
          <div className="text-xs text-gray-500">Freezes: {streakFreezes} ❄️</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className="w-[14px] h-[14px] rounded-[3px] transition-colors"
                style={{
                  backgroundColor: day.count === 0
                    ? '#1f2937'
                    : day.score >= 0.8
                      ? '#22c55e'
                      : day.score >= 0.6
                        ? '#84cc16'
                        : day.score >= 0.4
                          ? '#eab308'
                          : '#f97316',
                  opacity: day.count === 0 ? 0.3 : 0.4 + Math.min(day.count, 5) * 0.12,
                }}
                title={`${day.date}: ${day.count} sessions`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
