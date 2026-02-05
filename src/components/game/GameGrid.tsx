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
          color={showColor ? stimulus.color : '#6366f1'}
          size={48}
        />
      )}
      {!showShape && showColor && (
        <div
          className="w-12 h-12 rounded-full"
          style={{ backgroundColor: stimulus.color }}
        />
      )}
      {showNumber && (
        <span className="text-2xl font-bold text-white drop-shadow-lg">
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
      <div className={`relative rounded-2xl border-2 border-gray-700 bg-gray-900/50 p-3 ${flashClass}`}>
        <div className="flex items-center justify-center w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]">
          {stimulus && (
            <div className="w-24 h-24 rounded-xl bg-gray-700/80 border border-gray-500 flex items-center justify-center animate-scale-up">
              {cellContent}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard 3x3 grid mode
  return (
    <div className={`relative rounded-2xl border-2 border-gray-700 bg-gray-900/50 p-3 ${flashClass}`}>
      <div className="grid grid-cols-3 gap-2 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className={`
              rounded-lg border border-gray-700/50 flex items-center justify-center
              transition-all duration-150
              ${stimulus && stimulus.position === i
                ? 'bg-gray-700/80 border-gray-500'
                : 'bg-gray-800/30'
              }
            `}
          >
            {stimulus && stimulus.position === i && cellContent}
          </div>
        ))}
      </div>
    </div>
  );
}
