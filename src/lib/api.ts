import type {
  UserProfile,
  SessionRecord,
  SessionSaveResponse,
  StatsData,
  DailyChallenge,
  UserAchievement,
  GameSettings,
  SessionResults,
} from '../types';

const BASE = '/api';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function getProfile(): Promise<UserProfile> {
  return fetchJSON('/profile');
}

export async function saveSession(
  settings: GameSettings,
  results: SessionResults,
  overallScore: number,
  xpEarned: number,
  maxCombo: number
): Promise<SessionSaveResponse> {
  return fetchJSON('/sessions', {
    method: 'POST',
    body: JSON.stringify({
      nLevel: settings.nLevel,
      activeStimuli: settings.activeStimuli,
      trialCount: settings.trialCount,
      intervalMs: settings.intervalMs,
      results,
      overallScore,
      xpEarned,
      maxCombo,
    }),
  });
}

export async function getSessions(
  page: number = 1,
  limit: number = 20
): Promise<{ sessions: SessionRecord[]; total: number; page: number; pages: number }> {
  return fetchJSON(`/sessions?page=${page}&limit=${limit}`);
}

export async function getStats(): Promise<StatsData> {
  return fetchJSON('/stats');
}

export async function getAchievements(): Promise<UserAchievement[]> {
  return fetchJSON('/achievements');
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  return fetchJSON('/daily-challenge');
}
