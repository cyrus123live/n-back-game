import { useState, useCallback, useEffect, useRef } from 'react';
import type { StimulusType } from '../../types';
import { TUTORIAL_SEQUENCE, TUTORIAL_STEPS, TUTORIAL_N_LEVEL, TUTORIAL_STIMULI } from '../../lib/tutorialData';
import { isMatch } from '../../lib/sequence';
import { GameGrid } from '../game/GameGrid';
import { MatchButtons } from '../game/MatchButtons';
import type { ButtonFeedback } from '../game/MatchButtons';
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
  const [buttonFeedback, setButtonFeedback] = useState<Map<StimulusType, ButtonFeedback>>(new Map());
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
    // Evaluate end-of-trial feedback: show missed matches on buttons
    if (currentTrial >= TUTORIAL_N_LEVEL) {
      const endFeedback = new Map<StimulusType, ButtonFeedback>();
      let anyWrong = false;
      for (const type of TUTORIAL_STIMULI) {
        const wasMatch = isMatch(sequence, currentTrial, TUTORIAL_N_LEVEL, type);
        const responded = pressedThisTrial.has(type);
        if (wasMatch && !responded) {
          endFeedback.set(type, 'missed');
          anyWrong = true;
        } else if (!wasMatch && responded) {
          endFeedback.set(type, 'wrong');
          anyWrong = true;
        } else if (wasMatch && responded) {
          endFeedback.set(type, 'correct');
        }
      }
      setButtonFeedback(endFeedback);
      setFlashClass(anyWrong ? 'flash-orange' : 'flash-green');

      // Hold feedback briefly, then advance
      const next = currentTrial + 1;
      setTimeout(() => {
        setFlashClass('');
        setButtonFeedback(new Map());

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
    setButtonFeedback(new Map());
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
      <div className="max-w-lg mx-auto py-12 px-4 text-center space-y-6">
        <div className="text-5xl">🎉</div>
        <h1 className="text-3xl font-bold">Tutorial Complete!</h1>
        <p className="text-gray-400">
          You know the basics of N-Back training. Head to settings to customize your game and start playing!
        </p>
        <button onClick={handleComplete} className="btn-primary text-lg px-8 py-4">
          Start Playing
        </button>
      </div>
    );
  }

  const stimulus = showingStimulus ? sequence[currentTrial] : null;

  return (
    <div className="relative">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex items-center justify-between w-full max-w-md px-2">
          <span className="text-sm text-primary-400 font-medium">Tutorial - 2-Back</span>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-300 px-3 py-1"
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
          feedback={buttonFeedback.size > 0 ? buttonFeedback : undefined}
        />

        {phase === 'practice' && (
          <p className="text-xs text-gray-500 mt-2">
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
