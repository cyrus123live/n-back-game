import { useEffect, useState } from 'react';
import type { SessionRecord } from '../../types';
import { getSessions } from '../../lib/api';
import { STIMULUS_LABELS } from '../../lib/constants';

interface HistoryScreenProps {
  onBack: () => void;
}

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getSessions(page);
        setSessions(data.sessions);
        setTotalPages(data.pages);
      } catch {
        // not signed in
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">History</h1>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-16 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          No sessions yet. Play a round to see your history!
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {sessions.map((session) => {
              const date = new Date(session.createdAt);
              const scorePercent = Math.round(session.overallScore * 100);
              return (
                <div key={session.id} className="card flex items-center justify-between">
                  <div>
                    <div className="font-bold">
                      {session.nLevel}-Back
                      <span className="text-sm text-gray-400 ml-2 font-normal">
                        {session.activeStimuli.map((s) => STIMULUS_LABELS[s] || s).join(' + ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' • '}{session.trialCount} trials
                      {session.maxCombo > 0 && ` • ${session.maxCombo}× combo`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-black ${
                        scorePercent >= 90 ? 'text-green-400' :
                        scorePercent >= 70 ? 'text-yellow-400' :
                        scorePercent >= 50 ? 'text-orange-400' :
                        'text-red-400'
                      }`}
                    >
                      {scorePercent}%
                    </div>
                    <div className="text-xs text-yellow-400">+{session.xpEarned} XP</div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary text-sm px-4 py-2 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary text-sm px-4 py-2 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
