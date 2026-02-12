import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { GameSettings, SessionResults, DailyChallenge } from './types';
import { getProfile, syncQueuedSessions } from './lib/api';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { GameScreen } from './components/game/GameScreen';
import { ResultsScreen } from './components/results/ResultsScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { TutorialScreen } from './components/tutorial/TutorialScreen';
import { ProgramsScreen } from './components/programs/ProgramsScreen';

type View = 'dashboard' | 'game' | 'results' | 'history' | 'tutorial' | 'programs';

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const [view, setView] = useState<View>(() =>
    localStorage.getItem('unreel-tutorial-seen') ? 'dashboard' : 'tutorial'
  );
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [gameResults, setGameResults] = useState<{
    results: SessionResults;
    overallScore: number;
    xpEarned: number;
    maxCombo: number;
    adaptive?: boolean;
    startingLevel?: number;
    endingLevel?: number;
  } | null>(null);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    getProfile()
      .then((p) => setCurrentStreak(p.currentStreak))
      .catch(() => {});
  }, [view, isLoaded, isSignedIn]);

  // Sync offline-queued sessions on load and when coming back online
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const sync = () => {
      syncQueuedSessions().then(({ synced }) => {
        if (synced > 0) {
          getProfile()
            .then((p) => setCurrentStreak(p.currentStreak))
            .catch(() => {});
        }
      });
    };

    sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, [isLoaded, isSignedIn]);

  const handleDailyChallenge = useCallback((challenge: DailyChallenge) => {
    setGameSettings({
      nLevel: challenge.nLevel,
      activeStimuli: challenge.activeStimuli,
      trialCount: challenge.trialCount,
      intervalMs: challenge.intervalMs,
    });
    setGameKey((k) => k + 1);
    setView('game');
  }, []);

  const handleStartGame = useCallback((settings: GameSettings) => {
    setGameSettings(settings);
    setGameKey((k) => k + 1);
    setView('game');
  }, []);

  const handleGameFinish = useCallback(
    (
      results: SessionResults,
      overallScore: number,
      xpEarned: number,
      maxCombo: number,
      adaptiveData?: {
        adaptive: boolean;
        startingLevel: number;
        endingLevel: number;
      }
    ) => {
      setGameResults({ results, overallScore, xpEarned, maxCombo, ...adaptiveData });
      setView('results');
    },
    []
  );

  const handleTutorial = useCallback(() => {
    setView('tutorial');
  }, []);

  const handleProgramPlay = useCallback((settings: GameSettings, programId: string) => {
    setActiveProgramId(programId);
    setGameSettings(settings);
    setGameKey((k) => k + 1);
    setView('game');
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (gameSettings) {
      // If adaptive, use the recommended next level
      if (gameResults?.adaptive && gameResults.endingLevel) {
        setGameSettings({ ...gameSettings, nLevel: gameResults.endingLevel });
      }
      setGameResults(null);
      setGameKey((k) => k + 1);
      setView('game');
    }
  }, [gameSettings, gameResults]);

  const handleNavigate = useCallback((target: string) => {
    setView(target as View);
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen bg-surface" />;
  }

  return (
    <div className="min-h-screen bg-surface text-text-primary font-body">
      {view !== 'game' && view !== 'tutorial' && (
        <Navbar
          currentStreak={currentStreak}
          onNavigate={handleNavigate}
          currentView={view}
        />
      )}

      <main>
        {view === 'dashboard' && (
          <Dashboard
            onStart={handleStartGame}
            onDailyChallenge={handleDailyChallenge}
            onTutorial={handleTutorial}
            onNavigate={handleNavigate}
            onProgramPlay={handleProgramPlay}
            currentStreak={currentStreak}
          />
        )}

        {view === 'game' && gameSettings && (
          <GameScreen
            key={gameKey}
            settings={gameSettings}
            onFinish={handleGameFinish}
            onCancel={() => {
              setActiveProgramId(null);
              setView('dashboard');
            }}
          />
        )}

        {view === 'tutorial' && (
          <TutorialScreen
            onComplete={() => setView('dashboard')}
            onSkip={() => setView('dashboard')}
          />
        )}

        {view === 'results' && gameSettings && gameResults && (
          <ResultsScreen
            settings={gameSettings}
            results={gameResults.results}
            overallScore={gameResults.overallScore}
            xpEarned={gameResults.xpEarned}
            maxCombo={gameResults.maxCombo}
            adaptive={gameResults.adaptive}
            startingLevel={gameResults.startingLevel}
            endingLevel={gameResults.endingLevel}
            activeProgramId={activeProgramId}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={() => {
              setActiveProgramId(null);
              setView('dashboard');
            }}
            onNextProgramSession={handleProgramPlay}
            onStreakUpdate={setCurrentStreak}
          />
        )}

        {view === 'history' && (
          <HistoryScreen onBack={() => setView('dashboard')} />
        )}

        {view === 'programs' && (
          <ProgramsScreen
            onBack={() => setView('dashboard')}
            onStartSession={handleProgramPlay}
          />
        )}
      </main>
    </div>
  );
}
