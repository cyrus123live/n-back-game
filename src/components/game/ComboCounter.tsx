import { getComboColor } from '../../lib/scoring';

interface ComboCounterProps {
  combo: number;
  maxCombo: number;
}

export function ComboCounter({ combo, maxCombo }: ComboCounterProps) {
  const colorClass = getComboColor(combo);
  const isMilestone = combo === 5 || combo === 10 || combo === 15;
  const showCombo = combo > 0 || maxCombo > 0;

  return (
    <div className="flex items-center gap-4 h-10">
      {showCombo && (
        <>
          <div className={`flex items-center gap-2 ${colorClass}`}>
            <span className="text-sm text-text-muted">Combo</span>
            <span
              className={`
                text-3xl font-black tabular-nums transition-all duration-200
                ${isMilestone ? 'animate-bounce-in scale-110' : ''}
              `}
            >
              {combo}
            </span>
            {combo >= 5 && <span className="text-lg">x</span>}
          </div>
          {maxCombo > 0 && (
            <div className="text-xs text-text-muted">
              Best: {maxCombo}
            </div>
          )}
        </>
      )}
    </div>
  );
}
