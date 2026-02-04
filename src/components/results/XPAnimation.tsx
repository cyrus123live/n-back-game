import { useEffect, useState } from 'react';

interface XPAnimationProps {
  xp: number;
  isFirstPlayToday: boolean;
}

export function XPAnimation({ xp, isFirstPlayToday }: XPAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex flex-col items-center gap-1 animate-bounce-in">
      <div className="text-4xl font-black text-yellow-400 animate-fly-up">
        +{xp} XP
      </div>
      {isFirstPlayToday && (
        <div className="text-sm text-yellow-300 animate-slide-up">
          First play bonus! (1.5×)
        </div>
      )}
    </div>
  );
}
