import { useState, useCallback, useEffect, useRef } from 'react';
import type { StimulusType } from '../../types';
import { TUTORIAL_SEQUENCE, TUTORIAL_STEPS, TUTORIAL_N_LEVEL, TUTORIAL_STIMULI } from '../../lib/tutorialData';
import { isMatch } from '../../lib/sequence';
import { GameGrid } from '../game/GameGrid';
import { MatchButtons } from '../game/MatchButtons';
import { TrialProgress } from '../game/TrialProgress';
import { TutorialOverlay } from './TutorialOverlay';

interface TutorialScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialScreen({ onComplete, onSkip }: TutorialScreenProps) {
  const [currentTrial, setCurrentTrial] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [showingStimulus, setShowingStimulus] = useState(false);
  const [pressedThisTrial, setPressedThisTrial] = useState<Set<StimulusType>>(new Set());
  const [flashClass, setFlashClass] = useState('');
  const [phase, setPhase] = useState<'tutorial' | 'practice' | 'done'>('tutorial');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sequence = TUTORIAL_SEQUENCE;
  const currentStep = stepIndex < TUTORIAL_STEPS.length ? TUTORIAL_STEPS[stepIndex] : null;
  const intervalMs = 3000;

  // Determine if we should be paused for a tutorial step
  useEffect(() => {
    if (!currentStep) {
      setPaused(false);
      return;
    }

    if (currentStep.trialIndex === currentTrial) {
      if (currentStep.phase === 'before' && !showingStimulus) {
        setPaused(true);
      } else if (currentStep.phase === 'during' && showingStimulus) {
        setPaused(true);
      }
    }
  }, [currentTrial, showingStimulus, currentStep]);

  // Auto-advance trial timer
  useEffect(() => {
    if (paused || !showingStimulus || currentTrial >= sequence.length) return;

    timerRef.current = setTimeout(() => {
      advanceToNextTrial();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [paused, showingStimulus, currentTrial]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceToNextTrial = useCallback(() => {
    // Evaluate end-of-trial feedback via grid flash
    if (currentTrial >= TUTORIAL_N_LEVEL) {
      let anyWrong = false;
      for (const type of TUTORIAL_STIMULI) {
        const wasMatch = isMatch(sequence, currentTrial, TUTORIAL_N_LEVEL, type);
        const responded = pressedThisTrial.has(type);
        if ((wasMatch && !responded) || (!wasMatch && responded)) {
          anyWrong = true;
        }
      }
      setFlashClass(anyWrong ? 'flash-miss' : 'flash-green');

      // Hold feedback briefly, then advance
      const next = currentTrial + 1;
      setTimeout(() => {
        setFlashClass('');

        if (next >= sequence.length) {
          setPhase('done');
          setShowingStimulus(false);
          return;
        }

        setPressedThisTrial(new Set());
        setShowingStimulus(false);

        setTimeout(() => {
          setCurrentTrial(next);
          setShowingStimulus(true);
        }, 300);
      }, 600);
      return;
    }

    const next = currentTrial + 1;
    if (next >= sequence.length) {
      setPhase('done');
      setShowingStimulus(false);
      return;
    }

    setPressedThisTrial(new Set());
    setShowingStimulus(false);

    setTimeout(() => {
      setCurrentTrial(next);
      setShowingStimulus(true);
    }, 300);
  }, [currentTrial, pressedThisTrial, sequence]);

  const handleMatch = useCallback((type: StimulusType) => {
    if (pressedThisTrial.has(type)) return;
    setPressedThisTrial((prev) => new Set(prev).add(type));

    // If current step is waiting for this key, advance the step
    if (currentStep?.waitForKey === type) {
      setStepIndex((prev) => prev + 1);
      setPaused(false);
    }
  }, [pressedThisTrial, currentStep]);

  const handleNextStep = useCallback(() => {
    const step = TUTORIAL_STEPS[stepIndex];
    if (!step) return;

    // If this step waits for a key, simulate the match via the button
    if (step.waitForKey) {
      handleMatch(step.waitForKey);
      return;
    }

    if (step.phase === 'before') {
      // Show the stimulus now
      setShowingStimulus(true);
      setPaused(false);

      // Check if the next step is for the same trial during phase
      const nextStep = TUTORIAL_STEPS[stepIndex + 1];
      if (nextStep && nextStep.trialIndex === step.trialIndex && nextStep.phase === 'during') {
        setStepIndex(stepIndex + 1);
        // Will pause again when showingStimulus triggers
      } else {
        setStepIndex(stepIndex + 1);
      }
    } else {
      // 'during' phase step - advance to next step and unpause
      setStepIndex(stepIndex + 1);
      setPaused(false);
    }
  }, [stepIndex, handleMatch]);

  // Key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!showingStimulus) return;
      const keyMap: Record<string, StimulusType> = { a: 'position', s: 'color' };
      const type = keyMap[e.key.toLowerCase()];
      if (type && TUTORIAL_STIMULI.includes(type)) {
        handleMatch(type);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleMatch, showingStimulus]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('unreel-tutorial-seen', 'true');
    onSkip();
  }, [onSkip]);

  const handleComplete = useCallback(() => {
    localStorage.setItem('unreel-tutorial-seen', 'true');
    onComplete();
  }, [onComplete]);

  // Start the tutorial
  useEffect(() => {
    // First step is a 'before' step, so we start paused
    setPaused(true);
    setShowingStimulus(false);
  }, []);

  if (phase === 'done') {
    return (
      <div className="relative">
        <div className="flex flex-col items-center gap-4 py-4 opacity-50">
          <div className="flex items-center justify-between w-full max-w-md px-2">
            <span className="text-sm text-primary-500 font-medium">Tutorial - 2-Back</span>
          </div>
          <TrialProgress current={sequence.length} total={sequence.length} nLevel={TUTORIAL_N_LEVEL} />
          <GameGrid stimulus={null} activeStimuli={TUTORIAL_STIMULI} flashClass="" />
          <MatchButtons activeStimuli={TUTORIAL_STIMULI} onMatch={() => {}} pressedThisTrial={new Set()} disabled />
        </div>
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/20 pointer-events-auto" />
          <div className="absolute inset-0 flex items-end justify-center pb-8 px-4 pointer-events-none">
            <div className="card max-w-md w-full space-y-3 pointer-events-auto relative z-50 border-primary-500/30">
              <h3 className="font-bold text-lg text-primary-500">Tutorial Complete</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                You know the basics of N-Back training. Head to settings to customize your game and start playing!
              </p>
              <div className="flex justify-end pt-1">
                <button onClick={handleComplete} className="btn-primary text-sm px-4 py-2">
                  Start Playing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stimulus = showingStimulus ? sequence[currentTrial] : null;

  return (
    <div className="relative">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-center justify-between w-full max-w-md px-2">
          <span className="text-sm text-primary-500 font-medium">Tutorial - 2-Back</span>
          <button
            onClick={handleSkip}
            className="text-sm text-text-muted hover:text-text-secondary px-3 py-1"
          >
            Skip
          </button>
        </div>

        <TrialProgress
          current={currentTrial}
          total={sequence.length}
          nLevel={TUTORIAL_N_LEVEL}
        />

        <GameGrid
          stimulus={stimulus}
          activeStimuli={TUTORIAL_STIMULI}
          flashClass={flashClass}
        />

        <MatchButtons
          activeStimuli={TUTORIAL_STIMULI}
          onMatch={handleMatch}
          pressedThisTrial={pressedThisTrial}
          disabled={!showingStimulus || (paused && !currentStep?.waitForKey)}
        />

        {phase === 'practice' && (
          <p className="text-xs text-text-muted mt-2">
            Press the key when the current stimulus matches 2 back
          </p>
        )}
      </div>

      {/* Tutorial overlay */}
      {paused && currentStep && (
        <TutorialOverlay
          step={currentStep}
          onNext={handleNextStep}
          onSkip={handleSkip}
          stepIndex={stepIndex}
          totalSteps={TUTORIAL_STEPS.length}
        />
      )}
    </div>
  );
}
