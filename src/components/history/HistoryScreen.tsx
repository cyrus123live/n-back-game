import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { SessionRecord } from '../../types';
import { getSessions } from '../../lib/api';
import { STIMULUS_LABELS } from '../../lib/constants';

const LEVEL_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#a855f7',
  4: '#eab308',
  5: '#ef4444',
  6: '#f97316',
  7: '#ec4899',
  8: '#06b6d4',
  9: '#8b5cf6',
};

interface HistoryScreenProps {
  onBack: () => void;
}

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [allSessions, setAllSessions] = useState<SessionRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pageData, allData] = await Promise.all([
          getSessions(page),
          getSessions(1, 1000),
        ]);
        setSessions(pageData.sessions);
        setTotalPages(pageData.pages);
        setAllSessions(allData.sessions);
      } catch {
        // not signed in
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const chartData = useMemo(() => {
    if (allSessions.length === 0) return { data: [], levels: [] as number[] };

    // Group by date and N-level, compute average accuracy
    const byDateLevel: Record<string, Record<number, { total: number; count: number }>> = {};

    for (const s of allSessions) {
      const date = new Date(s.createdAt).toISOString().split('T')[0];
      if (!byDateLevel[date]) byDateLevel[date] = {};
      if (!byDateLevel[date][s.nLevel]) byDateLevel[date][s.nLevel] = { total: 0, count: 0 };
      byDateLevel[date][s.nLevel].total += s.overallScore;
      byDateLevel[date][s.nLevel].count += 1;
    }

    const levels = [...new Set(allSessions.map((s) => s.nLevel))].sort();

    const data = Object.entries(byDateLevel)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, levelData]) => {
        const row: Record<string, number | string> = { date };
        for (const level of levels) {
          if (levelData[level]) {
            row[`${level}-back`] = Math.round((levelData[level].total / levelData[level].count) * 100);
          }
        }
        return row;
      });

    return { data, levels };
  }, [allSessions]);

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
          {/* Average Accuracy Chart */}
          {chartData.data.length > 0 && (
            <div className="card">
              <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-4">
                Average Accuracy by Day
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={11}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={11}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  {chartData.levels.map((level) => (
                    <Line
                      key={level}
                      type="monotone"
                      dataKey={`${level}-back`}
                      stroke={LEVEL_COLORS[level] || '#6366f1'}
                      strokeWidth={2}
                      dot={{ fill: LEVEL_COLORS[level] || '#6366f1', r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Session List */}
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
