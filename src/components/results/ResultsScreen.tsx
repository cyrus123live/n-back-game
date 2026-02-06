import { useEffect, useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { SessionResults, GameSettings, AchievementDef, ProgramSessionResult } from '../../types';
import { calculateAccuracy } from '../../lib/scoring';
import { STIMULUS_LABELS, STIMULUS_COLORS, getAchievementDef, getRank, getLevelThresholds } from '../../lib/constants';
import { XPAnimation } from './XPAnimation';
import { saveSession, completeProgramSession } from '../../lib/api';
import { getTemplate } from '../../lib/programs';
import { AchievementIcon } from '../icons/AchievementIcon';
import { FlameIcon } from '../icons/FlameIcon';

interface ResultsScreenProps {
  settings: GameSettings;
  results: SessionResults;
  overallScore: number;
  xpEarned: number;
  maxCombo: number;
  adaptive?: boolean;
  startingLevel?: number;
  endingLevel?: number;
  activeProgramId?: string | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onNextProgramSession?: (settings: GameSettings, programId: string) => void;
  onStreakUpdate?: (streak: number) => void;
}

export function ResultsScreen({
  settings,
  results,
  overallScore,
  xpEarned,
  maxCombo,
  adaptive,
  startingLevel,
  endingLevel,
  activeProgramId,
  onPlayAgain,
  onBackToMenu,
  onNextProgramSession,
  onStreakUpdate,
}: ResultsScreenProps) {
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error' | 'queued'>('saving');
  const [serverXP, setServerXP] = useState(xpEarned);
  const [isFirstPlay, setIsFirstPlay] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDef[]>([]);
  const [isPersonalBest, setIsPersonalBest] = useState(false);
  const [newStreak, setNewStreak] = useState(0);
  const [programResult, setProgramResult] = useState<ProgramSessionResult | null>(null);
  const [xpBarData, setXpBarData] = useState<{
    oldProgress: number;
    newProgress: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    totalXp: number;
  } | null>(null);
  const confettiFired = useRef(false);

  useEffect(() => {
    const save = async () => {
      try {
        const response = await saveSession(
          settings, results, overallScore, xpEarned, maxCombo,
          adaptive ? { adaptive: true, startingLevel, endingLevel } : undefined
        );

        // Offline queued — skip server-dependent UI
        if ('queued' in response) {
          setSaveState('queued');
          return;
        }

        setServerXP(response.xpEarned);
        setIsFirstPlay(response.isFirstPlayToday);
        setLeveledUp(response.leveledUp);
        setIsPersonalBest(response.isPersonalBest);
        setNewStreak(response.newStreak);
        onStreakUpdate?.(response.newStreak);

        // Compute XP bar animation data
        if (response.totalXp != null) {
          const thresholds = getLevelThresholds();
          const newLevel = response.newLevel;
          const totalXp = response.totalXp;
          const oldTotalXp = totalXp - response.xpEarned;
          const currentThreshold = thresholds[newLevel - 1] || 0;
          const nextThreshold = thresholds[newLevel] || thresholds[thresholds.length - 1];
          const levelXpRange = nextThreshold - currentThreshold;
          const newLevelXp = totalXp - currentThreshold;

          // If level changed, animate from 0 to new progress
          const oldLevel = response.leveledUp
            ? newLevel - 1
            : newLevel;
          const oldThreshold = thresholds[oldLevel - 1] || 0;
          const oldNextThreshold = thresholds[oldLevel] || thresholds[thresholds.length - 1];
          const oldLevelRange = oldNextThreshold - oldThreshold;
          const oldLevelXp = oldTotalXp - oldThreshold;
          const oldProgress = response.leveledUp
            ? 0
            : oldLevelRange > 0 ? (oldLevelXp / oldLevelRange) * 100 : 100;
          const newProgress = levelXpRange > 0 ? (newLevelXp / levelXpRange) * 100 : 100;

          setXpBarData({
            oldProgress,
            newProgress,
            level: newLevel,
            currentLevelXp: newLevelXp,
            nextLevelXp: levelXpRange,
            totalXp,
          });
        }

        const achievements = response.newAchievements
          .map((id: string) => getAchievementDef(id))
          .filter((a: AchievementDef | undefined): a is AchievementDef => !!a);
        setNewAchievements(achievements);

        setSaveState('saved');

        // Complete program session if applicable
        if (activeProgramId && response.session?.id) {
          try {
            const result = await completeProgramSession(activeProgramId, response.session.id, overallScore);
            setProgramResult(result);
          } catch {
            // ignore
          }
        }

        // Fire confetti for level up, personal best, or high score
        if ((response.leveledUp || response.isPersonalBest || overallScore >= 0.9) && !confettiFired.current) {
          confettiFired.current = true;
          const particleCount = response.leveledUp ? 80 : response.isPersonalBest ? 60 : 40;
          confetti({
            particleCount,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch {
        setSaveState('error');
      }
    };

    save();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleNextSession = useCallback(() => {
    if (!programResult || !activeProgramId || !onNextProgramSession) return;
    const template = getTemplate(programResult.program.templateId);
    if (!template) return;
    const nextSession = template.sessions[programResult.program.currentDay - 1];
    if (!nextSession) return;
    onNextProgramSession(
      {
        nLevel: nextSession.nLevel,
        activeStimuli: nextSession.activeStimuli,
        trialCount: nextSession.trialCount,
        intervalMs: nextSession.intervalMs,
        adaptive: nextSession.adaptive,
      },
      activeProgramId
    );
  }, [programResult, activeProgramId, onNextProgramSession]);

  const getTomorrowHook = (): string | null => {
    if (saveState !== 'saved') return null;

    // 1. Program continuation
    if (activeProgramId && programResult && programResult.passed && !programResult.completed) {
      return `Your program continues with Day ${programResult.program.currentDay} tomorrow`;
    }

    // 2. Streak protection (>=7)
    if (newStreak >= 7) {
      return `Come back tomorrow to keep your ${newStreak}-day streak alive`;
    }

    // 3. Streak building (2-6)
    if (newStreak >= 2) {
      return `${newStreak} days and counting — come back tomorrow to keep it going`;
    }

    // 4. Streak starting (1) — skip, no message needed

    // 5. Achievement proximity — streak milestones
    const milestones = [7, 14, 30, 60, 100];
    for (const milestone of milestones) {
      const daysAway = milestone - newStreak;
      if (daysAway > 0 && daysAway <= 3) {
        return `${daysAway} more day${daysAway === 1 ? '' : 's'} until your ${milestone}-day streak achievement`;
      }
    }

    // 6. Personal best callback
    if (isPersonalBest) {
      return 'You set a new personal best — can you beat it tomorrow?';
    }

    // 7. Generic fallback
    return 'Every session strengthens your working memory — see you tomorrow';
  };

  const scorePercent = Math.round(overallScore * 100);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-10 px-5">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Round Complete</h1>
        <div
          className={`text-6xl font-black ${
            scorePercent >= 90 ? 'text-primary-500' :
            scorePercent >= 70 ? 'text-[#c4a035]' :
            scorePercent >= 50 ? 'text-[#c4a035]/70' :
            'text-text-muted'
          }`}
        >
          {scorePercent}%
        </div>
        <p className="text-text-muted">
          {adaptive ? `Adaptive ${startingLevel}-Back` : `${settings.nLevel}-Back`} · {settings.trialCount} trials
        </p>
      </div>

      {/* XP Animation */}
      <div className="flex justify-center">
        <XPAnimation xp={serverXP} isFirstPlayToday={isFirstPlay} />
      </div>

      {/* XP Level Bar */}
      {xpBarData && (
        <XPLevelBar data={xpBarData} />
      )}

      {/* Level Up */}
      {leveledUp && (
        <div className="card border-[#c4a035]/30 text-center animate-fade-in-up">
          <div className="text-2xl font-bold text-[#c4a035]">Level Up!</div>
        </div>
      )}

      {/* Personal Best */}
      {isPersonalBest && saveState === 'saved' && (
        <div className="card border-[#c4a035]/30 text-center animate-fade-in-up">
          <div className="text-2xl font-bold text-[#c4a035]">New Personal Best!</div>
          <div className="text-sm text-text-muted mt-1">
            {scorePercent}% at {adaptive ? `${endingLevel}` : `${settings.nLevel}`}-Back
          </div>
        </div>
      )}

      {/* Achievements */}
      {newAchievements.length > 0 && (
        <div className="space-y-2">
          {newAchievements.map((a) => (
            <div
              key={a.id}
              className="card border-primary-500/30 flex items-center gap-3 animate-fade-in-up"
            >
              <AchievementIcon category={a.category} className="w-8 h-8" />
              <div>
                <div className="font-bold text-primary-500">{a.name}</div>
                <div className="text-sm text-text-muted">{a.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adaptive Recommendation */}
      {adaptive && startingLevel != null && endingLevel != null && (
        <div className="card space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#8b6eae]/15 text-[#8b6eae] px-2 py-0.5 rounded">Adaptive Mode</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-sm">This Session</span>
            <span className="font-bold text-text-primary">{startingLevel}-Back</span>
          </div>
          {endingLevel !== startingLevel ? (
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-sm">Next Session</span>
              <span className={`font-bold ${endingLevel > startingLevel ? 'text-primary-500' : 'text-[#c4a035]'}`}>
                {endingLevel}-Back {endingLevel > startingLevel ? '(level up)' : '(level down)'}
              </span>
            </div>
          ) : (
            <div className="text-sm text-text-muted">
              Level stays at {startingLevel}-Back for next session
            </div>
          )}
        </div>
      )}

      {/* Per-type accuracy */}
      <div className="card space-y-3">
        <h2 className="text-sm text-text-muted font-medium uppercase tracking-wider">Accuracy by Type</h2>
        {settings.activeStimuli.map((type) => {
          const result = results[type];
          if (!result) return null;
          const accuracy = Math.round(calculateAccuracy(result) * 100);
          return (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{STIMULUS_LABELS[type]}</span>
                <span className="font-medium" style={{ color: STIMULUS_COLORS[type] }}>
                  {accuracy}%
                </span>
              </div>
              <div className="h-2 bg-secondary-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${accuracy}%`,
                    backgroundColor: STIMULUS_COLORS[type],
                  }}
                />
              </div>
              <div className="flex gap-4 text-xs text-text-muted">
                <span>Hits: {result.hits}</span>
                <span>Misses: {result.misses}</span>
                <span>False alarms: {result.falseAlarms}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Combo Stats */}
      <div className="card flex items-center justify-between">
        <div>
          <div className="text-sm text-text-muted">Max Combo</div>
          <div className="text-2xl font-bold text-text-primary">{maxCombo}</div>
        </div>
        {maxCombo >= 10 && (
          <FlameIcon className={`w-8 h-8 ${maxCombo >= 15 ? 'text-[#c4a035]' : 'text-[#8b6eae]'}`} />
        )}
      </div>

      {/* Program Progress */}
      {activeProgramId && programResult && (() => {
        const template = getTemplate(programResult.program.templateId);
        const templateName = template?.name || 'Program';

        if (programResult.completed) {
          return (
            <div className="card border-primary-500/30 space-y-2 animate-fade-in-up">
              <div className="font-bold text-primary-500 text-lg">Program Complete!</div>
              <div className="text-sm text-text-secondary">{templateName} finished!</div>
              <div className="text-xs text-text-muted">You've completed all sessions</div>
            </div>
          );
        }

        if (!programResult.passed) {
          return (
            <div className="card border-[#c4a035]/30 space-y-2">
              <div className="font-bold text-[#c4a035]">
                Day {programResult.program.currentDay} — Not quite!
              </div>
              <div className="text-sm text-text-secondary">
                Score: {scorePercent}% — {Math.round(programResult.requiredScore * 100)}% required to advance
              </div>
              <div className="text-xs text-text-muted">Keep practicing to move forward</div>
            </div>
          );
        }

        if (programResult.skippedTo) {
          const skipSession = template?.sessions[(programResult.skippedTo) - 1];
          return (
            <div className="card border-[#8b6eae]/30 space-y-2 animate-fade-in-up">
              <div className="font-bold text-[#8b6eae]">Skipping Ahead!</div>
              <div className="text-sm text-text-secondary">
                Score: {scorePercent}% — jumping to Day {programResult.skippedTo}
              </div>
              {skipSession && (
                <div className="text-xs text-text-muted">{skipSession.description}</div>
              )}
            </div>
          );
        }

        return (
          <div className="card border-primary-500/30 space-y-2 animate-fade-in-up">
            <div className="font-bold text-primary-500">
              Day {programResult.program.currentDay - 1} Complete!
            </div>
            <div className="text-sm text-text-secondary">
              Advancing to Day {programResult.program.currentDay}
            </div>
          </div>
        );
      })()}

      {/* Save status */}
      <div className="text-center text-xs text-text-muted">
        {saveState === 'saving' && 'Saving...'}
        {saveState === 'saved' && 'Session saved'}
        {saveState === 'queued' && 'Session saved offline — will sync when you reconnect'}
        {saveState === 'error' && 'Could not save session (sign in to save progress)'}
      </div>

      {/* Tomorrow Hook */}
      {(() => {
        const hook = getTomorrowHook();
        if (!hook) return null;
        return (
          <div className="text-center text-sm text-text-muted animate-fade-in-up">
            {hook}
          </div>
        );
      })()}

      {/* Actions */}
      {activeProgramId && programResult ? (
        programResult.completed ? (
          <div className="flex gap-3">
            <button onClick={onBackToMenu} className="btn-primary flex-1">
              Back to Menu
            </button>
          </div>
        ) : programResult.passed ? (
          <div className="flex gap-3">
            <button onClick={onBackToMenu} className="btn-secondary flex-1">
              Menu
            </button>
            <button onClick={handleNextSession} className="btn-primary flex-1">
              Next Session
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={onBackToMenu} className="btn-secondary flex-1">
              Menu
            </button>
            <button onClick={onPlayAgain} className="btn-primary flex-1">
              Try Again
            </button>
          </div>
        )
      ) : (
        <div className="flex gap-3">
          <button onClick={onBackToMenu} className="btn-secondary flex-1">
            Menu
          </button>
          <button onClick={onPlayAgain} className="btn-primary flex-1">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

function XPLevelBar({ data }: { data: { oldProgress: number; newProgress: number; level: number; currentLevelXp: number; nextLevelXp: number; totalXp: number } }) {
  const [progress, setProgress] = useState(data.oldProgress);
  const rank = getRank(data.level);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setProgress(data.newProgress), 400);
    return () => clearTimeout(timer);
  }, [data.newProgress]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: rank.color }}>
          Lv {data.level} {rank.name}
        </span>
        <span className="text-xs text-text-muted">
          {data.totalXp.toLocaleString()} total XP
        </span>
      </div>
      <div className="h-3 bg-secondary-surface rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: rank.color,
          }}
        />
      </div>
      <div className="text-xs text-text-muted mt-1">
        {data.currentLevelXp} / {data.nextLevelXp} XP to next level
      </div>
    </div>
  );
}
