import type { GameSettings, SessionResults, AdaptiveLevelChange } from '../types';

const STORAGE_KEY = 'unreel-offline-sessions';

export interface QueuedSession {
  id: string;
  payload: {
    nLevel: number;
    activeStimuli: string[];
    trialCount: number;
    intervalMs: number;
    results: SessionResults;
    overallScore: number;
    xpEarned: number;
    maxCombo: number;
    tz: string;
    localDate: string;
    adaptive?: boolean;
    startingLevel?: number;
    endingLevel?: number;
    levelChanges?: AdaptiveLevelChange[];
  };
}

export function enqueueSession(payload: QueuedSession['payload']): void {
  const queue = getQueuedSessions();
  queue.push({ id: crypto.randomUUID(), payload });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function getQueuedSessions(): QueuedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeFromQueue(id: string): void {
  const queue = getQueuedSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function getQueueLength(): number {
  return getQueuedSessions().length;
}

export async function syncQueuedSessions(): Promise<{ synced: number; failed: number }> {
  const queue = getQueuedSessions();
  let synced = 0;
  let failed = 0;

  for (const session of queue) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session.payload),
        cache: 'no-store',
      });

      if (res.ok) {
        removeFromQueue(session.id);
        synced++;
      } else if (res.status === 401) {
        // Auth expired — keep in queue for later
        failed++;
      } else {
        failed++;
      }
    } catch {
      // Network error — stop trying
      failed += queue.length - synced - failed;
      break;
    }
  }

  return { synced, failed };
}
