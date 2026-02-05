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
  return fetchJSON('/stats');
}

export async function getAchievements(): Promise<UserAchievement[]> {
  return fetchJSON('/achievements');
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  return fetchJSON('/daily-challenge');
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
