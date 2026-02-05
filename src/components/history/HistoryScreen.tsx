import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { SessionRecord, UserAchievement } from '../../types';
import { getSessions, deleteSession, getAchievements } from '../../lib/api';
import { STIMULUS_LABELS } from '../../lib/constants';
import { AchievementGrid } from '../dashboard/AchievementGrid';

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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pageData, allData, achData] = await Promise.all([
          getSessions(page),
          getSessions(1, 1000),
          getAchievements(),
        ]);
        setSessions(pageData.sessions);
        setTotalPages(pageData.pages);
        setAllSessions(allData.sessions);
        setAchievements(achData);
      } catch {
        // not signed in
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSession(deleteTarget);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget));
      setAllSessions((prev) => prev.filter((s) => s.id !== deleteTarget));
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const chartData = useMemo(() => {
    if (allSessions.length === 0) return { data: [], levels: [] as number[] };

    // Group by date and N-level, compute average accuracy
    const byDateLevel: Record<string, Record<number, { total: number; count: number }>> = {};

    for (const s of allSessions) {
      const dt = new Date(s.createdAt);
      const date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
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

  // Compute average by stimulus type from all sessions
  const avgByStimulus = useMemo(() => {
    const totals: Record<string, { hits: number; total: number }> = {};

    for (const session of allSessions) {
      for (const [type, result] of Object.entries(session.results)) {
        if (!totals[type]) totals[type] = { hits: 0, total: 0 };
        totals[type].hits += result.hits;
        totals[type].total += result.hits + result.misses + result.falseAlarms;
      }
    }

    const avg: Record<string, number> = {};
    for (const [type, data] of Object.entries(totals)) {
      if (data.total > 0) {
        avg[type] = Math.round((data.hits / data.total) * 100);
      }
    }
    return avg;
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
                    tickFormatter={(val: string) => {
                      const [, m, d] = val.split('-');
                      return `${parseInt(m)}/${parseInt(d)}`;
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
                    labelFormatter={(label: string) => {
                      const [, m, d] = String(label).split('-');
                      return `${parseInt(m)}/${parseInt(d)}`;
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

          {/* Average by Stimulus Type */}
          {Object.keys(avgByStimulus).length > 0 && (
            <div className="card">
              <h3 className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-3">
                Average by Type
              </h3>
              <div className="space-y-2">
                {Object.entries(avgByStimulus).map(([type, avg]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">{type}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${avg}%`,
                            backgroundColor: avg >= 80 ? '#22c55e' : avg >= 60 ? '#eab308' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-primary-300 w-10 text-right">{avg}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          <AchievementGrid userAchievements={achievements} />

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
                      {session.adaptive && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded ml-2">
                          Adaptive
                        </span>
                      )}
                      <span className="text-sm text-gray-400 ml-2 font-normal">
                        {session.activeStimuli.map((s) => STIMULUS_LABELS[s] || s).join(' + ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' • '}{session.trialCount} trials
                      {session.maxCombo > 0 && ` • ${session.maxCombo}× combo`}
                      {session.adaptive && session.startingLevel != null && session.endingLevel != null && (
                        <> • {session.startingLevel} → {session.endingLevel}</>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <button
                      onClick={() => setDeleteTarget(session.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold">Delete this session?</h3>
            <p className="text-sm text-gray-400">This action cannot be undone. XP earned from this session will not be recalculated.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary flex-1"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
