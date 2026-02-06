import type { StimulusType } from '../../types';
import { STIMULUS_KEY_MAP } from '../../types';
import { STIMULUS_COLORS } from '../../lib/constants';
import { StimulusIcon } from '../icons/StimulusIcon';

interface MatchButtonsProps {
  activeStimuli: StimulusType[];
  onMatch: (type: StimulusType) => void;
  pressedThisTrial: Set<StimulusType>;
  disabled: boolean;
}

export function MatchButtons({ activeStimuli, onMatch, pressedThisTrial, disabled }: MatchButtonsProps) {
  return (
    <div className="flex gap-2 mt-4 w-full max-w-md px-2">
      {activeStimuli.map((type) => (
        <MatchButton
          key={type}
          type={type}
          pressed={pressedThisTrial.has(type)}
          onMatch={onMatch}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function MatchButton({
  type,
  pressed,
  onMatch,
  disabled,
}: {
  type: StimulusType;
  pressed: boolean;
  onMatch: (type: StimulusType) => void;
  disabled: boolean;
}) {
  const key = STIMULUS_KEY_MAP[type];
  const color = STIMULUS_COLORS[type];

  return (
    <button
      onClick={() => onMatch(type)}
      disabled={disabled}
      className={`
        relative flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl
        font-semibold text-sm transition-all duration-150 active:scale-[0.98]
        border-2
        ${pressed
          ? 'scale-[0.98]'
          : 'border-card-border bg-card hover:bg-secondary-surface hover:border-text-muted/30'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={pressed ? { borderColor: color, backgroundColor: `${color}15` } : undefined}
    >
      <StimulusIcon type={type} className={`w-5 h-5 ${pressed ? '' : 'text-text-muted'}`} style={pressed ? { color } : undefined} />
      <span className="key-hint" style={pressed ? { backgroundColor: color, color: 'white' } : {}}>
        {key}
      </span>
    </button>
  );
}
