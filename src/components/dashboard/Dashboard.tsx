import { useEffect, useState } from 'react';
import type { UserProfile, StatsData, DailyChallenge as DailyChallengeType, UserAchievement as UserAchievementType, GameSettings, TrainingProgramRecord } from '../../types';
import { getProfile, getStats, getDailyChallenge, getAchievements, getPrograms } from '../../lib/api';
import { StreakCard } from './StreakCard';
import { LevelCard } from './LevelCard';
import { ProgressChart } from './ProgressChart';
import { AchievementGrid } from './AchievementGrid';
import { DailyChallenge } from './DailyChallenge';
import { ProgramCard } from '../programs/ProgramCard';

interface DashboardProps {
  onPlay: () => void;
  onDailyChallenge: (challenge: DailyChallengeType) => void;
  onTutorial: () => void;
  onNavigate: (view: string) => void;
  onProgramPlay: (settings: GameSettings, programId: string) => void;
}

export function Dashboard({ onPlay, onDailyChallenge, onTutorial, onNavigate, onProgramPlay }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [challenge, setChallenge] = useState<DailyChallengeType | null>(null);
  const [achievements, setAchievements] = useState<UserAchievementType[]>([]);
  const [activeProgram, setActiveProgram] = useState<TrainingProgramRecord | null>(null);
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

        // Load active program
        try {
          const programsData = await getPrograms();
          const active = programsData.programs.find((p: TrainingProgramRecord) => p.status === 'active');
          if (active) setActiveProgram(active);
        } catch {
          // ignore if not signed in
        }
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

  const showTutorialPrompt = stats?.totalSessions === 0 && !localStorage.getItem('unreel-tutorial-seen');

  return (
    <div className="max-w-lg mx-auto space-y-4 py-6 px-4">
      {/* Tutorial Prompt for new users */}
      {showTutorialPrompt && (
        <button
          onClick={onTutorial}
          className="w-full card border-primary-500/50 bg-primary-950/30 hover:bg-primary-900/30 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-1">
                New here?
              </div>
              <div className="font-bold text-lg">Learn How to Play</div>
              <div className="text-sm text-gray-400 mt-1">A guided walkthrough of the N-Back task</div>
            </div>
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </button>
      )}

      {/* Active Program Card */}
      {activeProgram && (
        <ProgramCard program={activeProgram} onContinue={onProgramPlay} />
      )}

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

      {/* Quick Links */}
      <div className="flex gap-3">
        <button
          onClick={onTutorial}
          className="btn-secondary flex-1 text-sm py-3"
        >
          How to Play
        </button>
        <button
          onClick={() => onNavigate('programs')}
          className="btn-secondary flex-1 text-sm py-3"
        >
          Training Programs
        </button>
      </div>
    </div>
  );
}
