import type { TrainingProgramRecord } from '../../types';
import type { ProgramTemplate } from '../../lib/programs';
import { STIMULUS_LABELS } from '../../lib/constants';

interface ProgramDetailProps {
  template: ProgramTemplate;
  program?: TrainingProgramRecord;
}

export function ProgramDetail({ template, program }: ProgramDetailProps) {
  const completedDays = program ? program.currentDay - 1 : 0;

  return (
    <div className="space-y-2">
      {template.sessions.map((session) => {
        const isCompleted = session.day <= completedDays;
        const isCurrent = program?.status === 'active' && session.day === program.currentDay;

        return (
          <div
            key={session.day}
            className={`
              flex items-center gap-3 p-3 rounded-xl text-sm
              ${isCurrent ? 'bg-primary-950/30 border border-primary-500/30' : 'bg-gray-800/50'}
              ${isCompleted ? 'opacity-60' : ''}
            `}
          >
            <div className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              ${isCompleted ? 'bg-green-500/20 text-green-400' :
                isCurrent ? 'bg-primary-500/20 text-primary-400' :
                'bg-gray-700 text-gray-400'}
            `}>
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : session.day}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-300 truncate">
                {session.nLevel}-Back • {session.activeStimuli.map((s) => STIMULUS_LABELS[s]).join(' + ')}
                {session.adaptive && <span className="text-purple-400 ml-1">(Adaptive)</span>}
              </div>
              <div className="text-xs text-gray-500 truncate">{session.description}</div>
            </div>
            <div className="text-xs text-gray-500 flex-shrink-0">
              {session.trialCount}t / {session.intervalMs / 1000}s
            </div>
          </div>
        );
      })}
    </div>
  );
}
