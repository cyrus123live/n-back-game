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
  const leftHand: StimulusType[] = ['position', 'color', 'shape'];
  const rightHand: StimulusType[] = ['number', 'audio'];

  const leftActive = leftHand.filter((s) => activeStimuli.includes(s));
  const rightActive = rightHand.filter((s) => activeStimuli.includes(s));

  return (
    <div className="flex items-center justify-center gap-8 mt-4">
      <div className="flex gap-2">
        {leftActive.map((type) => (
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
      {leftActive.length > 0 && rightActive.length > 0 && (
        <div className="w-px h-12 bg-gray-700" />
      )}
      <div className="flex gap-2">
        {rightActive.map((type) => (
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
    ? { borderColor: '#ef4444', backgroundColor: '#ef444430' }
    : feedback === 'missed'
    ? { borderColor: '#eab308', backgroundColor: '#eab30830' }
    : feedback === 'correct'
    ? { borderColor: '#22c55e', backgroundColor: '#22c55e30' }
    : pressed
    ? { borderColor: color, backgroundColor: `${color}20` }
    : undefined;

  return (
    <button
      onClick={() => onMatch(type)}
      disabled={disabled}
      className={`
        relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl
        font-semibold text-sm transition-all duration-150 active:scale-95
        border-2 min-w-[80px]
        ${feedback
          ? ''
          : pressed
          ? 'border-white/40 bg-white/10 scale-95'
          : 'border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={feedbackStyle}
    >
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="key-hint" style={pressed ? { backgroundColor: color, color: 'white' } : {}}>
        {key}
      </span>
    </button>
  );
}
