import type { StimulusType } from '../../types';
import { STIMULUS_KEY_MAP } from '../../types';
import { STIMULUS_LABELS, STIMULUS_COLORS } from '../../lib/constants';

export type ButtonFeedback = 'correct' | 'wrong' | 'missed';

interface MatchButtonsProps {
  activeStimuli: StimulusType[];
  onMatch: (type: StimulusType) => void;
  pressedThisTrial: Set<StimulusType>;
  disabled: boolean;
  feedback?: Map<StimulusType, ButtonFeedback>;
}

export function MatchButtons({ activeStimuli, onMatch, pressedThisTrial, disabled, feedback }: MatchButtonsProps) {
  return (
    <div className="flex gap-2 mt-4 w-full max-w-md px-2">
      {activeStimuli.map((type) => (
        <MatchButton
          key={type}
          type={type}
          pressed={pressedThisTrial.has(type)}
          onMatch={onMatch}
          disabled={disabled}
          feedback={feedback?.get(type)}
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
  feedback,
}: {
  type: StimulusType;
  pressed: boolean;
  onMatch: (type: StimulusType) => void;
  disabled: boolean;
  feedback?: ButtonFeedback;
}) {
  const key = STIMULUS_KEY_MAP[type];
  const label = STIMULUS_LABELS[type];
  const color = STIMULUS_COLORS[type];

  const feedbackStyle = feedback === 'wrong'
    ? { borderColor: '#787774', backgroundColor: '#78777420' }
    : feedback === 'missed'
    ? { borderColor: '#c4a035', backgroundColor: '#c4a03520' }
    : feedback === 'correct'
    ? { borderColor: '#538d4e', backgroundColor: '#538d4e20' }
    : pressed
    ? { borderColor: color, backgroundColor: `${color}15` }
    : undefined;

  return (
    <button
      onClick={() => onMatch(type)}
      disabled={disabled}
      className={`
        relative flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
        font-semibold text-sm transition-all duration-150 active:scale-[0.98]
        border-2
        ${feedback
          ? ''
          : pressed
          ? 'scale-[0.98]'
          : 'border-card-border bg-card hover:bg-secondary-surface hover:border-text-muted/30'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={feedbackStyle}
    >
      <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      <span className="key-hint" style={pressed ? { backgroundColor: color, color: 'white' } : {}}>
        {key}
      </span>
    </button>
  );
}
