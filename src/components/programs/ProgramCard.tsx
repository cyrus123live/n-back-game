import type { GameSettings, TrainingProgramRecord } from '../../types';
import { getTemplate, getRequiredScore, SKIP_THRESHOLD } from '../../lib/programs';
import { STIMULUS_LABELS } from '../../lib/constants';

interface ProgramCardProps {
  program: TrainingProgramRecord;
  onContinue: (settings: GameSettings, programId: string) => void;
}

export function ProgramCard({ program, onContinue }: ProgramCardProps) {
  const template = getTemplate(program.templateId);
  if (!template) return null;

  const todaySession = template.sessions[program.currentDay - 1];
  if (!todaySession) return null;

  const progress = ((program.currentDay - 1) / template.totalDays) * 100;

  const handleContinue = () => {
    onContinue(
      {
        nLevel: todaySession.nLevel,
        activeStimuli: todaySession.activeStimuli,
        trialCount: todaySession.trialCount,
        intervalMs: todaySession.intervalMs,
        adaptive: todaySession.adaptive,
      },
      program.id
    );
  };

  return (
    <div className="card border-primary-500/30 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-primary-500 font-semibold uppercase tracking-wider">
            Active Program
          </div>
          <div className="font-bold text-lg text-text-primary">{template.name}</div>
        </div>
        <div className="text-sm text-text-muted">
          Day {program.currentDay} / {template.totalDays}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Today's session */}
      <div className="bg-secondary-surface rounded-xl p-3 space-y-1">
        <div className="text-sm font-medium text-text-secondary">
          {todaySession.nLevel}-Back · {todaySession.activeStimuli.map((s) => STIMULUS_LABELS[s]).join(' + ')}
          {todaySession.adaptive && <span className="text-[#8b6eae] ml-1">(Adaptive)</span>}
        </div>
        <div className="text-xs text-text-muted">{todaySession.description}</div>
        <div className="text-xs text-text-muted mt-1">
          Score {Math.round(getRequiredScore(todaySession) * 100)}% to advance · {Math.round(SKIP_THRESHOLD * 100)}% to skip ahead
        </div>
      </div>

      <button onClick={handleContinue} className="btn-primary w-full">
        Continue Program
      </button>
    </div>
  );
}
