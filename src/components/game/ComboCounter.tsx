import { getComboColor } from '../../lib/scoring';

interface ComboCounterProps {
  combo: number;
  maxCombo: number;
}

export function ComboCounter({ combo, maxCombo }: ComboCounterProps) {
  if (combo === 0 && maxCombo === 0) return null;

  const colorClass = getComboColor(combo);
  const isHigh = combo >= 5;
  const isMilestone = combo === 5 || combo === 10 || combo === 15;

  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 ${colorClass}`}>
        <span className="text-sm text-gray-400">Combo</span>
        <span
          className={`
            text-3xl font-black tabular-nums transition-all duration-200
            ${isHigh ? 'animate-pulse-fast' : ''}
            ${isMilestone ? 'animate-bounce-in scale-125' : ''}
          `}
        >
          {combo}
        </span>
        {combo >= 5 && <span className="text-lg">×</span>}
      </div>
      {maxCombo > 0 && (
        <div className="text-xs text-gray-500">
          Best: {maxCombo}
        </div>
      )}
    </div>
  );
}
