import type {
  UserProfile,
  SessionRecord,
  SessionSaveResponse,
  StatsData,
  DailyChallenge,
  UserAchievement,
  GameSettings,
  SessionResults,
  AdaptiveLevelChange,
  ProgramsResponse,
  TrainingProgramRecord,
  ProgramSessionResult,
} from '../types';

const BASE = '/api';
const USER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function getProfile(): Promise<UserProfile> {
  return fetchJSON(`/profile?tz=${encodeURIComponent(USER_TZ)}`);
}

export async function saveSession(
  settings: GameSettings,
  results: SessionResults,
  overallScore: number,
  xpEarned: number,
  maxCombo: number,
  adaptiveData?: {
    adaptive: boolean;
    startingLevel?: number;
    endingLevel?: number;
    levelChanges?: AdaptiveLevelChange[];
  }
): Promise<SessionSaveResponse> {
  return fetchJSON('/sessions', {
    method: 'POST',
    body: JSON.stringify({
      nLevel: adaptiveData?.endingLevel ?? settings.nLevel,
      activeStimuli: settings.activeStimuli,
      trialCount: settings.trialCount,
      intervalMs: settings.intervalMs,
      results,
      overallScore,
      xpEarned,
      maxCombo,
      tz: USER_TZ,
      ...(adaptiveData ? {
        adaptive: true,
        startingLevel: adaptiveData.startingLevel,
        endingLevel: adaptiveData.endingLevel,
        levelChanges: adaptiveData.levelChanges,
      } : {}),
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
  return fetchJSON(`/stats?tz=${encodeURIComponent(USER_TZ)}`);
}

export async function getAchievements(): Promise<UserAchievement[]> {
  return fetchJSON('/achievements');
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  return fetchJSON(`/daily-challenge?tz=${encodeURIComponent(USER_TZ)}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetchJSON(`/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function getPrograms(): Promise<ProgramsResponse> {
  return fetchJSON('/programs');
}

export async function enrollInProgram(templateId: string): Promise<{ program: TrainingProgramRecord }> {
  return fetchJSON('/programs/enroll', {
    method: 'POST',
    body: JSON.stringify({ templateId }),
  });
}

export async function completeProgramSession(programId: string, sessionId: string, score: number): Promise<ProgramSessionResult> {
  return fetchJSON(`/programs/${programId}/complete-session`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, score }),
  });
}

export async function abandonProgram(programId: string): Promise<void> {
  await fetchJSON(`/programs/${programId}`, { method: 'DELETE' });
}
