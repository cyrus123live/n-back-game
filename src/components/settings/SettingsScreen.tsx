import { useState } from 'react';
import type { StimulusType, GameSettings, DailyChallenge } from '../../types';
import { STIMULUS_LABELS, STIMULUS_COLORS } from '../../lib/constants';
import { STIMULUS_KEY_MAP } from '../../types';

interface SettingsScreenProps {
  onStart: (settings: GameSettings) => void;
  dailyChallenge?: DailyChallenge | null;
  onBack: () => void;
}

const TRIAL_OPTIONS = [20, 25, 30];
const INTERVAL_OPTIONS = [
  { value: 2000, label: '2.0s' },
  { value: 2500, label: '2.5s' },
  { value: 3000, label: '3.0s' },
];

const ALL_STIMULI: StimulusType[] = ['position', 'color', 'shape', 'number', 'audio'];

export function SettingsScreen({ onStart, dailyChallenge, onBack }: SettingsScreenProps) {
  const [nLevel, setNLevel] = useState(2);
  const [activeStimuli, setActiveStimuli] = useState<StimulusType[]>(['position', 'audio']);
  const [trialCount, setTrialCount] = useState(25);
  const [intervalMs, setIntervalMs] = useState(2500);

  const toggleStimulus = (type: StimulusType) => {
    setActiveStimuli((prev) => {
      if (prev.includes(type)) {
        if (prev.length <= 1) return prev; // Must have at least 1
        return prev.filter((s) => s !== type);
      }
      return [...prev, type];
    });
  };

  const handleStart = () => {
    onStart({ nLevel, activeStimuli, trialCount, intervalMs });
  };

  const handleDailyChallenge = () => {
    if (dailyChallenge) {
      onStart({
        nLevel: dailyChallenge.nLevel,
        activeStimuli: dailyChallenge.activeStimuli,
        trialCount: dailyChallenge.trialCount,
        intervalMs: dailyChallenge.intervalMs,
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6 px-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Game Settings</h1>
      </div>

      {/* Daily Challenge Banner */}
      {dailyChallenge && (
        <button
          onClick={handleDailyChallenge}
          className="w-full card border-primary-500/50 bg-primary-950/30 hover:bg-primary-900/30 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-primary-400 font-semibold uppercase tracking-wider mb-1">
                Daily Challenge
              </div>
              <div className="font-bold">
                {dailyChallenge.nLevel}-Back • {dailyChallenge.activeStimuli.map((s) => STIMULUS_LABELS[s]).join(' + ')}
              </div>
              <div className="text-sm text-primary-300 mt-1">2× XP Bonus</div>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </button>
      )}

      {/* N-Level */}
      <div className="card">
        <label className="block text-sm text-gray-400 mb-3 font-medium">N-Back Level</label>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => setNLevel(n)}
              className={`
                w-12 h-12 rounded-xl font-bold text-lg transition-all
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

      {/* Stimulus Types */}
      <div className="card">
        <label className="block text-sm text-gray-400 mb-3 font-medium">
          Stimulus Types ({activeStimuli.length} active)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {ALL_STIMULI.map((type) => {
            const active = activeStimuli.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleStimulus(type)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl transition-all
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
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${active ? '' : 'opacity-30'}`}
                    style={{ backgroundColor: STIMULUS_COLORS[type] }}
                  />
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-400'}`}>
                    {STIMULUS_LABELS[type]}
                  </span>
                </div>
                <span className="key-hint">{STIMULUS_KEY_MAP[type]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trial Count */}
      <div className="card">
        <label className="block text-sm text-gray-400 mb-3 font-medium">Trials</label>
        <div className="flex gap-2">
          {TRIAL_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => setTrialCount(count)}
              className={`
                flex-1 py-3 rounded-xl font-medium transition-all
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
      <div className="card">
        <label className="block text-sm text-gray-400 mb-3 font-medium">Interval</label>
        <div className="flex gap-2">
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setIntervalMs(opt.value)}
              className={`
                flex-1 py-3 rounded-xl font-medium transition-all
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

      {/* Start Button */}
      <button onClick={handleStart} className="btn-primary w-full text-lg py-4">
        Start {nLevel}-Back
      </button>
    </div>
  );
}
