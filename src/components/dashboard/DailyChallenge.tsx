import { useState, useEffect } from 'react';
import type { DailyChallenge as DailyChallengeType } from '../../types';
import { STIMULUS_LABELS } from '../../lib/constants';
import { TargetIcon } from '../icons/TargetIcon';

interface DailyChallengeProps {
  challenge: DailyChallengeType | null;
  onPlay: () => void;
}

export function DailyChallenge({ challenge, onPlay }: DailyChallengeProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!challenge) return;

    const update = () => {
      const now = Date.now();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [challenge]);

  if (!challenge) {
    return (
      <div className="card animate-pulse">
        <div className="h-20 bg-secondary-surface rounded" />
      </div>
    );
  }

  return (
    <button
      onClick={onPlay}
      className="card w-full text-left border-primary-500/30 hover:border-primary-500/60 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-primary-500 font-semibold uppercase tracking-wider mb-1">
            Daily Challenge
          </div>
          <div className="font-bold text-lg text-text-primary group-hover:text-primary-500 transition-colors">
            {challenge.nLevel}-Back
          </div>
          <div className="text-sm text-text-muted mt-0.5">
            {challenge.activeStimuli.map((s) => STIMULUS_LABELS[s]).join(' + ')}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[#c4a035] font-medium">2x XP</span>
            <span className="text-xs text-text-muted">Resets in {timeLeft}</span>
          </div>
        </div>
        <TargetIcon className="w-10 h-10 text-primary-500 group-hover:scale-110 transition-transform" />
      </div>
    </button>
  );
}
