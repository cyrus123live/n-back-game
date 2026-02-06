import { useState, useEffect } from 'react';
import { getRank } from '../../lib/constants';
import { getLocalDate } from '../../lib/api';
import type { StatsData } from '../../types';
import { FlameIcon } from '../icons/FlameIcon';

interface CompactStatsCardProps {
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  heatmap: StatsData['heatmap'];
  lastPlayedDate: string | null;
}

export function CompactStatsCard({
  level,
  xp,
  currentLevelXp,
  nextLevelXp,
  currentStreak,
  longestStreak,
  totalSessions,
  heatmap,
  lastPlayedDate,
}: CompactStatsCardProps) {
  const rank = getRank(level);
  const progress = nextLevelXp > 0 ? (currentLevelXp / nextLevelXp) * 100 : 100;

  // Build 12-week calendar grid
  const today = new Date();
  const weeks: { date: string; count: number; score: number }[][] = [];

  for (let w = 11; w >= 0; w--) {
    const week: { date: string; count: number; score: number }[] = [];
    for (let d = 0; d < 7; d++) {
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

  // Streak danger countdown
  const [streakCountdown, setStreakCountdown] = useState('');
  const showStreakDanger = currentStreak > 0 && lastPlayedDate != null && lastPlayedDate !== getLocalDate();

  useEffect(() => {
    if (!showStreakDanger) return;

    const update = () => {
      const now = Date.now();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now;

      if (diff <= 0) {
        setStreakCountdown('now!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setStreakCountdown(`${hours}h ${minutes}m`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [showStreakDanger]);

  const getStreakDangerColor = () => {
    const now = Date.now();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    const hoursLeft = (tomorrow.getTime() - now) / (1000 * 60 * 60);
    if (hoursLeft >= 8) return { text: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-200' };
    if (hoursLeft >= 4) return { text: 'text-[#c4a035]', bg: 'bg-[#c4a035]/10', border: 'border-[#c4a035]/30' };
    return { text: 'text-[#b85c4e]', bg: 'bg-[#b85c4e]/10', border: 'border-[#b85c4e]/30' };
  };

  return (
    <div className="card">
      {/* Top row: level/rank, streak, sessions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black" style={{ color: rank.color }}>
            Lv {level}
          </span>
          <span className="text-sm font-semibold" style={{ color: rank.color }}>
            {rank.name}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="text-[#c4a035] font-bold">{currentStreak}</span>
            <FlameIcon className="w-4 h-4 text-[#c4a035]" />
          </span>
          <span className="flex items-center gap-1 text-text-muted">
            <span className="font-bold text-text-secondary">{totalSessions}</span>
            sessions
          </span>
        </div>
      </div>

      {/* Streak Danger Banner */}
      {showStreakDanger && (() => {
        const colors = getStreakDangerColor();
        return (
          <div className={`rounded-lg px-3 py-2 mb-2 border ${colors.bg} ${colors.border} flex items-center justify-between`}>
            <span className={`text-sm font-medium ${colors.text}`}>
              Streak expires in {streakCountdown}
            </span>
            <span className="text-xs text-text-muted">Play to keep your {currentStreak}-day streak!</span>
          </div>
        );
      })()}

      {/* XP Progress Bar */}
      <div className="mb-3">
        <div className="h-2.5 bg-secondary-surface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: rank.color,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>{currentLevelXp} / {nextLevelXp} XP</span>
          <span>{xp.toLocaleString()} total</span>
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
                    ? 'var(--color-card-border)'
                    : day.score >= 0.8
                      ? '#538d4e'
                      : day.score >= 0.6
                        ? '#6aae62'
                        : day.score >= 0.4
                          ? '#c4a035'
                          : '#d4885a',
                  opacity: day.count === 0 ? 0.4 : 0.5 + Math.min(day.count, 5) * 0.1,
                }}
                title={`${day.date}: ${day.count} sessions${day.count > 0 ? ` (${Math.round(day.score * 100)}% avg)` : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-xs text-text-muted mt-1">
        Longest streak: {longestStreak} days
      </div>
    </div>
  );
}
