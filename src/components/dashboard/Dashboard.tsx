import { useEffect, useState } from 'react';
import type { UserProfile, StatsData, DailyChallenge as DailyChallengeType, UserAchievement as UserAchievementType } from '../../types';
import { getProfile, getStats, getDailyChallenge, getAchievements } from '../../lib/api';
import { StreakCard } from './StreakCard';
import { LevelCard } from './LevelCard';
import { ProgressChart } from './ProgressChart';
import { AchievementGrid } from './AchievementGrid';
import { DailyChallenge } from './DailyChallenge';

interface DashboardProps {
  onPlay: () => void;
  onDailyChallenge: (challenge: DailyChallengeType) => void;
}

export function Dashboard({ onPlay, onDailyChallenge }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [challenge, setChallenge] = useState<DailyChallengeType | null>(null);
  const [achievements, setAchievements] = useState<UserAchievementType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, c, a] = await Promise.all([
          getProfile(),
          getStats(),
          getDailyChallenge(),
          getAchievements(),
        ]);
        setProfile(p);
        setStats(s);
        setChallenge(c);
        setAchievements(a);
      } catch {
        // User may not be signed in
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4 py-6 px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-24 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Unauthenticated / no profile: show simple play button
  if (!profile) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-2">Unreel</h1>
          <p className="text-gray-400">Train your working memory with the N-Back task</p>
        </div>
        <button onClick={onPlay} className="btn-primary text-xl px-12 py-5">
          Play
        </button>
        <p className="text-sm text-gray-500">Sign in to track progress, earn XP, and unlock achievements</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 py-6 px-4">
      {/* Play Button */}
      <button
        onClick={onPlay}
        className="w-full btn-primary text-xl py-5 flex items-center justify-center gap-3"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        Play
      </button>

      {/* Daily Challenge */}
      <DailyChallenge
        challenge={challenge}
        onPlay={() => challenge && onDailyChallenge(challenge)}
      />

      {/* Level & Streak */}
      <div className="grid grid-cols-1 gap-4">
        <LevelCard
          level={profile.level}
          xp={profile.xp}
          currentLevelXp={profile.currentLevelXp}
          nextLevelXp={profile.nextLevelXp}
        />
        <StreakCard
          currentStreak={profile.currentStreak}
          longestStreak={profile.longestStreak}
          streakFreezes={profile.streakFreezes}
          heatmap={stats?.heatmap || {}}
        />
      </div>

      {/* Stats */}
      {stats && (
        <>
          {/* Highest N-Level */}
          <div className="card flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Highest Level Played</div>
              <div className="text-3xl font-black text-primary-400">{stats.highestNLevel}-Back</div>
            </div>
            <div className="text-sm text-gray-500">{stats.totalSessions} total sessions</div>
          </div>

          <ProgressChart data={stats.scoreTrend} />

          {/* Avg by stimulus type */}
          {Object.keys(stats.avgByStimulus).length > 0 && (
            <div className="card">
              <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-3">
                Average by Type
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.avgByStimulus).map(([type, avg]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">{type}</span>
                    <span className="text-sm font-medium text-primary-300">{avg}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Achievements */}
      <AchievementGrid userAchievements={achievements} />
    </div>
  );
}
