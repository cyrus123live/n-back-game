import { useEffect, useState } from 'react';
import type { UserProfile, StatsData, DailyChallenge as DailyChallengeType, GameSettings, TrainingProgramRecord, StimulusType } from '../../types';
import { getProfile, getStats, getDailyChallenge, getPrograms } from '../../lib/api';
import { STIMULUS_LABELS, STIMULUS_COLORS } from '../../lib/constants';
import { STIMULUS_KEY_MAP } from '../../types';
import { CompactStatsCard } from './CompactStatsCard';
import { DailyChallenge } from './DailyChallenge';
import { ProgramCard } from '../programs/ProgramCard';

interface DashboardProps {
  onStart: (settings: GameSettings) => void;
  onDailyChallenge: (challenge: DailyChallengeType) => void;
  onTutorial: () => void;
  onNavigate: (view: string) => void;
  onProgramPlay: (settings: GameSettings, programId: string) => void;
}

const ALL_STIMULI: StimulusType[] = ['position', 'color', 'shape', 'number', 'audio'];
const TRIAL_OPTIONS = [20, 25, 30];
const INTERVAL_OPTIONS = [
  { value: 2000, label: '2.0s' },
  { value: 2500, label: '2.5s' },
  { value: 3000, label: '3.0s' },
];

export function Dashboard({ onStart, onDailyChallenge, onTutorial, onNavigate, onProgramPlay }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [challenge, setChallenge] = useState<DailyChallengeType | null>(null);
  const [activeProgram, setActiveProgram] = useState<TrainingProgramRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline settings state
  const [nLevel, setNLevel] = useState(2);
  const [activeStimuli, setActiveStimuli] = useState<StimulusType[]>(['position', 'color']);
  const [trialCount, setTrialCount] = useState(25);
  const [intervalMs, setIntervalMs] = useState(2500);
  const [adaptive, setAdaptive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, s, c] = await Promise.all([
          getProfile(),
          getStats(),
          getDailyChallenge(),
        ]);
        setProfile(p);
        setStats(s);
        setChallenge(c);

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

  const toggleStimulus = (type: StimulusType) => {
    setActiveStimuli((prev) => {
      if (prev.includes(type)) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s !== type);
      }
      return [...prev, type];
    });
  };

  const handleStart = () => {
    onStart({ nLevel, activeStimuli, trialCount, intervalMs, adaptive });
  };

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

  // Unauthenticated / no profile: show inline settings + play
  if (!profile) {
    return (
      <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-2">Unreel</h1>
          <p className="text-gray-400">Train your working memory with the N-Back task</p>
        </div>

        {/* Inline Settings */}
        {renderSettings()}

        <p className="text-sm text-gray-500 text-center">Sign in to track progress, earn XP, and unlock achievements</p>
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

      {/* Inline Settings */}
      {renderSettings()}

      {/* Daily Challenge */}
      <DailyChallenge
        challenge={challenge}
        onPlay={() => challenge && onDailyChallenge(challenge)}
      />

      {/* Compact Stats */}
      {stats && profile && (
        <CompactStatsCard
          level={profile.level}
          xp={profile.xp}
          currentLevelXp={profile.currentLevelXp}
          nextLevelXp={profile.nextLevelXp}
          currentStreak={profile.currentStreak}
          longestStreak={profile.longestStreak}
          totalSessions={stats.totalSessions}
          heatmap={stats.heatmap}
        />
      )}

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

  function renderSettings() {
    return (
      <>
        {/* N-Level Picker */}
        <div className="card">
          <label className="block text-sm text-gray-400 mb-3 font-medium">
            {adaptive ? 'Starting Level' : 'N-Back Level'}
          </label>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => setNLevel(n)}
                className={`
                  w-11 h-11 rounded-xl font-bold text-lg transition-all
                  ${n === nLevel
                    ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Stimuli Toggles */}
        <div className="card">
          <label className="block text-sm text-gray-400 mb-3 font-medium">
            Stimuli ({activeStimuli.length} active)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_STIMULI.map((type) => {
              const active = activeStimuli.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleStimulus(type)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium
                    border-2
                    ${active
                      ? 'border-opacity-60 bg-opacity-10'
                      : 'border-gray-700 bg-gray-800/50 hover:bg-gray-700/50'
                    }
                  `}
                  style={
                    active
                      ? { borderColor: STIMULUS_COLORS[type], backgroundColor: `${STIMULUS_COLORS[type]}15` }
                      : {}
                  }
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all ${active ? '' : 'opacity-30'}`}
                    style={{ backgroundColor: STIMULUS_COLORS[type] }}
                  />
                  <span className={active ? 'text-white' : 'text-gray-400'}>
                    {STIMULUS_LABELS[type]}
                  </span>
                  <span className="key-hint text-xs">{STIMULUS_KEY_MAP[type]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Section (collapsible) */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors w-full"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Settings
        </button>

        {showAdvanced && (
          <div className="card space-y-4">
            {/* Trial Count */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Trials</label>
              <div className="flex gap-2">
                {TRIAL_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setTrialCount(count)}
                    className={`
                      flex-1 py-2.5 rounded-xl font-medium transition-all text-sm
                      ${count === trialCount
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Interval</label>
              <div className="flex gap-2">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setIntervalMs(opt.value)}
                    className={`
                      flex-1 py-2.5 rounded-xl font-medium transition-all text-sm
                      ${opt.value === intervalMs
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Adaptive Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-gray-300 font-medium">Adaptive Difficulty</label>
                <p className="text-xs text-gray-500 mt-0.5">N-level adjusts based on performance</p>
              </div>
              <button
                onClick={() => setAdaptive(!adaptive)}
                className={`
                  relative w-12 h-7 rounded-full transition-colors duration-200
                  ${adaptive ? 'bg-primary-600' : 'bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform duration-200
                    ${adaptive ? 'translate-x-5' : 'translate-x-0.5'}
                  `}
                />
              </button>
            </div>
          </div>
        )}

        {/* Start Button */}
        <button onClick={handleStart} className="btn-primary w-full text-lg py-4">
          Start {nLevel}-Back{adaptive ? ' (Adaptive)' : ''}
        </button>
      </>
    );
  }
}
