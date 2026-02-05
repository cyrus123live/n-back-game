import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { SessionResults, GameSettings, AchievementDef, AdaptiveLevelChange } from '../../types';
import { calculateAccuracy } from '../../lib/scoring';
import { STIMULUS_LABELS, STIMULUS_COLORS, getAchievementDef } from '../../lib/constants';
import { XPAnimation } from './XPAnimation';
import { saveSession, completeProgramSession } from '../../lib/api';

interface ResultsScreenProps {
  settings: GameSettings;
  results: SessionResults;
  overallScore: number;
  xpEarned: number;
  maxCombo: number;
  adaptive?: boolean;
  startingLevel?: number;
  endingLevel?: number;
  levelChanges?: AdaptiveLevelChange[];
  activeProgramId?: string | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
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
  levelChanges,
  activeProgramId,
  onPlayAgain,
  onBackToMenu,
}: ResultsScreenProps) {
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error' | 'offline'>('saving');
  const [serverXP, setServerXP] = useState(xpEarned);
  const [isFirstPlay, setIsFirstPlay] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDef[]>([]);
  const confettiFired = useRef(false);

  useEffect(() => {
    const save = async () => {
      try {
        const response = await saveSession(
          settings, results, overallScore, xpEarned, maxCombo,
          adaptive ? { adaptive: true, startingLevel, endingLevel, levelChanges } : undefined
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
            await completeProgramSession(activeProgramId, response.session.id);
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

      {/* Adaptive Journey */}
      {adaptive && startingLevel != null && endingLevel != null && (
        <div className="card space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Adaptive Mode</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Starting Level</span>
            <span className="font-bold">{startingLevel}-Back</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Ending Level</span>
            <span className="font-bold text-primary-400">{endingLevel}-Back</span>
          </div>
          {levelChanges && levelChanges.length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-1">Level Changes</p>
              {levelChanges.map((change, i) => (
                <p key={i} className="text-xs text-gray-400">
                  Trial {change.trial + 1}: {change.fromLevel} → {change.toLevel}
                  <span className={change.toLevel > change.fromLevel ? 'text-green-400 ml-1' : 'text-orange-400 ml-1'}>
                    {change.toLevel > change.fromLevel ? '(up)' : '(down)'}
                  </span>
                </p>
              ))}
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

      {/* Save status */}
      <div className="text-center text-xs text-gray-500">
        {saveState === 'saving' && 'Saving...'}
        {saveState === 'saved' && 'Session saved'}
        {saveState === 'error' && 'Could not save session (sign in to save progress)'}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onBackToMenu} className="btn-secondary flex-1">
          Menu
        </button>
        <button onClick={onPlayAgain} className="btn-primary flex-1">
          Play Again
        </button>
      </div>
    </div>
  );
}
