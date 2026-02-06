import type { TutorialStep } from '../../lib/tutorialData';

interface TutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
  stepIndex: number;
  totalSteps: number;
}

export function TutorialOverlay({ step, onNext, onSkip, stepIndex, totalSteps }: TutorialOverlayProps) {
  const keyLabel = step.waitForKey === 'position' ? 'Position' : 'Audio';

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" />

      {/* Tooltip card */}
      <div className="absolute inset-0 flex items-end justify-center pb-8 px-4 pointer-events-none">
        <div className="card max-w-md w-full space-y-3 pointer-events-auto relative z-50 border-primary-500/30">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg text-primary-500">{step.title}</h3>
            <span className="text-xs text-text-muted">{stepIndex + 1}/{totalSteps}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{step.message}</p>
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onSkip}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Skip Tutorial
            </button>
            {!step.waitForKey ? (
              <button
                onClick={onNext}
                className="btn-primary text-sm px-4 py-2"
              >
                {stepIndex === totalSteps - 1 ? 'Start Practice' : 'Got it'}
              </button>
            ) : (
              <button
                onClick={onNext}
                className="btn-primary text-sm px-4 py-2 ring-2 ring-primary-300 ring-offset-2 ring-offset-[var(--color-card)]"
              >
                {keyLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
