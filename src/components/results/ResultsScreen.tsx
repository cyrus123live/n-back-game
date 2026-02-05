import { useEffect, useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { SessionResults, GameSettings, AchievementDef, ProgramSessionResult } from '../../types';
import { calculateAccuracy } from '../../lib/scoring';
import { STIMULUS_LABELS, STIMULUS_COLORS, getAchievementDef } from '../../lib/constants';
import { XPAnimation } from './XPAnimation';
import { saveSession, completeProgramSession } from '../../lib/api';
import { getTemplate } from '../../lib/programs';

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
}: ResultsScreenProps) {
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error' | 'offline'>('saving');
  const [serverXP, setServerXP] = useState(xpEarned);
  const [isFirstPlay, setIsFirstPlay] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDef[]>([]);
  const [programResult, setProgramResult] = useState<ProgramSessionResult | null>(null);
  const confettiFired = useRef(false);

  useEffect(() => {
    const save = async () => {
      try {
        const response = await saveSession(
          settings, results, overallScore, xpEarned, maxCombo,
          adaptive ? { adaptive: true, startingLevel, endingLevel } : undefined
        );
        setServerXP(response.xpEarned);
        setIsFirstPlay(response.isFirstPlayToday);
        setLeveledUp(response.leveledUp);

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

        // Fire confetti for level up or high score
        if ((response.leveledUp || overallScore >= 0.9) && !confettiFired.current) {
          confettiFired.current = true;
          confetti({
            particleCount: response.leveledUp ? 200 : 100,
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

  const scorePercent = Math.round(overallScore * 100);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Round Complete</h1>
        <div
          className={`text-6xl font-black ${
            scorePercent >= 90 ? 'text-green-400' :
            scorePercent >= 70 ? 'text-yellow-400' :
            scorePercent >= 50 ? 'text-orange-400' :
            'text-red-400'
          }`}
        >
          {scorePercent}%
        </div>
        <p className="text-gray-400">
          {adaptive ? `Adaptive ${startingLevel}-Back` : `${settings.nLevel}-Back`} • {settings.trialCount} trials
        </p>
      </div>

      {/* XP Animation */}
      <div className="flex justify-center">
        <XPAnimation xp={serverXP} isFirstPlayToday={isFirstPlay} />
      </div>

      {/* Level Up */}
      {leveledUp && (
        <div className="card border-yellow-500/50 bg-yellow-950/20 text-center animate-bounce-in">
          <div className="text-2xl font-bold text-yellow-400">Level Up!</div>
        </div>
      )}

      {/* Achievements */}
      {newAchievements.length > 0 && (
        <div className="space-y-2">
          {newAchievements.map((a) => (
            <div
              key={a.id}
              className="card border-primary-500/50 bg-primary-950/20 flex items-center gap-3 animate-slide-up"
            >
              <span className="text-3xl">{a.icon}</span>
              <div>
                <div className="font-bold text-primary-300">{a.name}</div>
                <div className="text-sm text-gray-400">{a.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adaptive Recommendation */}
      {adaptive && startingLevel != null && endingLevel != null && (
        <div className="card space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Adaptive Mode</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">This Session</span>
            <span className="font-bold">{startingLevel}-Back</span>
          </div>
          {endingLevel !== startingLevel ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Next Session</span>
              <span className={`font-bold ${endingLevel > startingLevel ? 'text-green-400' : 'text-orange-400'}`}>
                {endingLevel}-Back {endingLevel > startingLevel ? '(level up)' : '(level down)'}
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Level stays at {startingLevel}-Back for next session
            </div>
          )}
        </div>
      )}

      {/* Per-type accuracy */}
      <div className="card space-y-3">
        <h2 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Accuracy by Type</h2>
        {settings.activeStimuli.map((type) => {
          const result = results[type];
          if (!result) return null;
          const accuracy = Math.round(calculateAccuracy(result) * 100);
          return (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{STIMULUS_LABELS[type]}</span>
                <span className="font-medium" style={{ color: STIMULUS_COLORS[type] }}>
                  {accuracy}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${accuracy}%`,
                    backgroundColor: STIMULUS_COLORS[type],
                  }}
                />
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
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
          <div className="text-sm text-gray-400">Max Combo</div>
          <div className="text-2xl font-bold">{maxCombo}</div>
        </div>
        {maxCombo >= 10 && (
          <div className="text-3xl">
            {maxCombo >= 15 ? '🔥' : '⚡'}
          </div>
        )}
      </div>

      {/* Program Progress */}
      {activeProgramId && programResult && (() => {
        const template = getTemplate(programResult.program.templateId);
        const templateName = template?.name || 'Program';

        if (programResult.completed) {
          return (
            <div className="card border-green-500/30 bg-green-950/20 space-y-2 animate-slide-up">
              <div className="font-bold text-green-400 text-lg">Program Complete!</div>
              <div className="text-sm text-gray-300">{templateName} finished!</div>
              <div className="text-xs text-gray-500">You've completed all sessions</div>
            </div>
          );
        }

        if (!programResult.passed) {
          return (
            <div className="card border-orange-500/30 bg-orange-950/20 space-y-2">
              <div className="font-bold text-orange-400">
                Day {programResult.program.currentDay} — Not quite!
              </div>
              <div className="text-sm text-gray-300">
                Score: {scorePercent}% — {Math.round(programResult.requiredScore * 100)}% required to advance
              </div>
              <div className="text-xs text-gray-500">Keep practicing to move forward</div>
            </div>
          );
        }

        if (programResult.skippedTo) {
          const skipSession = template?.sessions[(programResult.skippedTo) - 1];
          return (
            <div className="card border-purple-500/30 bg-purple-950/20 space-y-2 animate-slide-up">
              <div className="font-bold text-purple-400">Skipping Ahead!</div>
              <div className="text-sm text-gray-300">
                Score: {scorePercent}% — jumping to Day {programResult.skippedTo}
              </div>
              {skipSession && (
                <div className="text-xs text-gray-500">{skipSession.description}</div>
              )}
            </div>
          );
        }

        return (
          <div className="card border-green-500/30 bg-green-950/20 space-y-2 animate-slide-up">
            <div className="font-bold text-green-400">
              Day {programResult.program.currentDay - 1} Complete!
            </div>
            <div className="text-sm text-gray-300">
              Advancing to Day {programResult.program.currentDay}
            </div>
          </div>
        );
      })()}

      {/* Save status */}
      <div className="text-center text-xs text-gray-500">
        {saveState === 'saving' && 'Saving...'}
        {saveState === 'saved' && 'Session saved'}
        {saveState === 'error' && 'Could not save session (sign in to save progress)'}
      </div>

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
