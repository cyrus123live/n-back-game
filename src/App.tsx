import { useState, useCallback, useEffect } from 'react';
import type { GameSettings, SessionResults, DailyChallenge } from './types';
import { getProfile } from './lib/api';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { GameScreen } from './components/game/GameScreen';
import { ResultsScreen } from './components/results/ResultsScreen';
import { HistoryScreen } from './components/history/HistoryScreen';

type View = 'dashboard' | 'settings' | 'game' | 'results' | 'history';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [gameResults, setGameResults] = useState<{
    results: SessionResults;
    overallScore: number;
    xpEarned: number;
    maxCombo: number;
  } | null>(null);

  useEffect(() => {
    getProfile()
      .then((p) => setCurrentStreak(p.currentStreak))
      .catch(() => {});
  }, [view]);

  const handlePlay = useCallback(() => {
    setView('settings');
  }, []);

  const handleDailyChallenge = useCallback((challenge: DailyChallenge) => {
    setGameSettings({
      nLevel: challenge.nLevel,
      activeStimuli: challenge.activeStimuli,
      trialCount: challenge.trialCount,
      intervalMs: challenge.intervalMs,
    });
    setView('game');
  }, []);

  const handleStartGame = useCallback((settings: GameSettings) => {
    setGameSettings(settings);
    setView('game');
  }, []);

  const handleGameFinish = useCallback(
    (results: SessionResults, overallScore: number, xpEarned: number, maxCombo: number) => {
      setGameResults({ results, overallScore, xpEarned, maxCombo });
      setView('results');
    },
    []
  );

  const handlePlayAgain = useCallback(() => {
    if (gameSettings) {
      setGameResults(null);
      setView('game');
    }
  }, [gameSettings]);

  const handleNavigate = useCallback((target: string) => {
    setView(target as View);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {view !== 'game' && (
        <Navbar
          currentStreak={currentStreak}
          onNavigate={handleNavigate}
          currentView={view}
        />
      )}

      <main>
        {view === 'dashboard' && (
          <Dashboard onPlay={handlePlay} onDailyChallenge={handleDailyChallenge} />
        )}

        {view === 'settings' && (
          <SettingsScreen
            onStart={handleStartGame}
            onBack={() => setView('dashboard')}
          />
        )}

        {view === 'game' && gameSettings && (
          <GameScreen
            key={Date.now()}
            settings={gameSettings}
            onFinish={handleGameFinish}
            onCancel={() => setView('settings')}
          />
        )}

        {view === 'results' && gameSettings && gameResults && (
          <ResultsScreen
            settings={gameSettings}
            results={gameResults.results}
            overallScore={gameResults.overallScore}
            xpEarned={gameResults.xpEarned}
            maxCombo={gameResults.maxCombo}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={() => setView('dashboard')}
          />
        )}

        {view === 'history' && (
          <HistoryScreen onBack={() => setView('dashboard')} />
        )}
      </main>
    </div>
  );
}
