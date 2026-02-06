import type { TrainingProgramRecord } from '../../types';
import type { ProgramTemplate } from '../../lib/programs';
import { DEFAULT_REQUIRED_SCORE, SKIP_THRESHOLD } from '../../lib/programs';
import { STIMULUS_LABELS } from '../../lib/constants';

interface ProgramDetailProps {
  template: ProgramTemplate;
  program?: TrainingProgramRecord;
}

export function ProgramDetail({ template, program }: ProgramDetailProps) {
  const completedDays = program ? program.currentDay - 1 : 0;

  return (
    <div className="space-y-2">
      <div className="text-xs text-text-muted pb-1">
        Score {Math.round(DEFAULT_REQUIRED_SCORE * 100)}% to advance · {Math.round(SKIP_THRESHOLD * 100)}% to skip ahead
      </div>
      {template.sessions.map((session) => {
        const isCompleted = session.day <= completedDays;
        const isCurrent = program?.status === 'active' && session.day === program.currentDay;

        return (
          <div
            key={session.day}
            className={`
              flex items-center gap-3 p-3 rounded-xl text-sm
              ${isCurrent ? 'bg-primary-50 border border-primary-500/30' : isCompleted ? 'bg-secondary-surface' : 'bg-card'}
              ${isCompleted ? 'opacity-60' : ''}
            `}
          >
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              ${isCompleted ? 'bg-primary-500/15 text-primary-500' :
                isCurrent ? 'bg-primary-500/20 text-primary-500' :
                'bg-secondary-surface text-text-muted'}
            `}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : session.day}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-text-secondary truncate">
                {session.nLevel}-Back · {session.activeStimuli.map((s) => STIMULUS_LABELS[s]).join(' + ')}
                {session.adaptive && <span className="text-[#8b6eae] ml-1">(Adaptive)</span>}
              </div>
              <div className="text-xs text-text-muted truncate">{session.description}</div>
            </div>
            <div className="text-xs text-text-muted flex-shrink-0">
              {session.trialCount}t / {session.intervalMs / 1000}s
            </div>
          </div>
        );
      })}
    </div>
  );
}
