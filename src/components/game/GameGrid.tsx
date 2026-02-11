import type { TrialStimulus, StimulusType } from '../../types';
import { ShapeRenderer } from './ShapeRenderer';

interface GameGridProps {
  stimulus: TrialStimulus | null;
  activeStimuli: StimulusType[];
  flashClass: string;
}

export function GameGrid({ stimulus, activeStimuli, flashClass }: GameGridProps) {
  const showPosition = activeStimuli.includes('position');
  const showShape = activeStimuli.includes('shape');
  const showColor = activeStimuli.includes('color');
  const showNumber = activeStimuli.includes('number');

  const cellContent = stimulus && (
    <div className="flex flex-col items-center gap-0.5 animate-scale-up">
      {showShape && (
        <ShapeRenderer
          shape={stimulus.shape}
          color={showColor ? '#ffffff' : '#538d4e'}
          size={48}
        />
      )}
      {showNumber && (
        <span className="text-2xl font-bold text-text-primary drop-shadow-sm">
          {stimulus.number}
        </span>
      )}
      {!showShape && !showColor && !showNumber && (
        <div className="w-10 h-10 rounded-lg bg-primary-500" />
      )}
    </div>
  );

  // Single-square mode when position is not active
  if (!showPosition) {
    return (
      <div className={`relative rounded-2xl border-2 border-card-border bg-secondary-surface p-3 ${flashClass}`}>
        <div className="flex items-center justify-center w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]">
          {stimulus && (
            <div
              className="w-24 h-24 rounded-xl bg-card border border-card-border flex items-center justify-center animate-scale-up"
              style={showColor ? { backgroundColor: stimulus.color } : undefined}
            >
              {cellContent}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard 3x3 grid mode
  return (
    <div className={`relative rounded-2xl border-2 border-card-border bg-secondary-surface p-3 ${flashClass}`}>
      <div className="grid grid-cols-3 gap-2 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={`
              rounded-lg border flex items-center justify-center
              transition-all duration-150
              ${stimulus && stimulus.position === i
                ? 'bg-card border-card-border shadow-sm animate-scale-up'
                : 'bg-secondary-surface border-card-border'
              }
            `}
            style={stimulus && stimulus.position === i && showColor
              ? { backgroundColor: stimulus.color }
              : undefined
            }
          >
            {stimulus && stimulus.position === i && cellContent}
          </div>
        ))}
      </div>
    </div>
  );
}
