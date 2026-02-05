import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { getAuth } from '@clerk/express';
import { formatDateInTz, getYesterdayStr } from '../lib/dates.js';
import { streakDebugLogs } from './sessions.js';

const router = Router();

function getClerkUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth?.userId ?? null;
}

async function getOrCreateProfile(clerkUserId: string) {
  return prisma.userProfile.upsert({
    where: { clerkUserId },
    create: { clerkUserId },
    update: {},
  });
}

// GET /api/profile - Get or create user profile
router.get('/profile', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);

    // Check if streak is broken (missed yesterday without freeze)
    const userTz = (req.query.tz as string) || 'UTC';
    // Use client-provided local date to avoid server-side timezone conversion issues (Alpine small-icu)
    const localDate = req.query.localDate as string | undefined;
    const todayStr = (typeof localDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(localDate))
      ? localDate
      : formatDateInTz(new Date(), userTz);
    const yesterdayStr = getYesterdayStr(todayStr);
    // Use stored lastPlayedDate (client's local date) with fallback to timezone conversion
    const lastPlayedStr = profile.lastPlayedDate
      ?? (profile.lastPlayedAt ? formatDateInTz(profile.lastPlayedAt, userTz) : null);

    // DEBUG: Log profile streak check
    streakDebugLogs.push(`[${new Date().toISOString()}] PROFILE CHECK: ${JSON.stringify({
      clientLocalDate: localDate,
      clientTz: userTz,
      todayStr,
      yesterdayStr,
      lastPlayedStr,
      lastPlayedDate_db: profile.lastPlayedDate,
      lastPlayedAt_db: profile.lastPlayedAt?.toISOString() ?? null,
      currentStreak_db: profile.currentStreak,
    })}`);
    if (streakDebugLogs.length > 50) streakDebugLogs.shift();

    let streakBroken = false;
    if (lastPlayedStr && lastPlayedStr < yesterdayStr && profile.currentStreak > 0) {
      streakDebugLogs.push(`[${new Date().toISOString()}] PROFILE BREAKING STREAK! "${lastPlayedStr}" < "${yesterdayStr}"`);
      streakBroken = true;
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { currentStreak: 0 },
      });
      profile.currentStreak = 0;
    }

    // Calculate XP needed for next level
    const thresholds = [0];
    let threshold = 0;
    for (let i = 1; i <= 50; i++) {
      threshold += 100 + (i - 1) * 50;
      thresholds.push(threshold);
    }
    const currentLevelThreshold = thresholds[profile.level - 1] || 0;
    const nextLevelThreshold = thresholds[profile.level] || thresholds[thresholds.length - 1];

    res.json({
      ...profile,
      streakBroken,
      currentLevelXp: profile.xp - currentLevelThreshold,
      nextLevelXp: nextLevelThreshold - currentLevelThreshold,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/stats - Aggregate statistics
router.get('/stats', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);

    const statsTz = (req.query.tz as string) || 'UTC';

    const sessions = await prisma.session.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Score trend over last 30 sessions
    const recentSessions = sessions.slice(0, 30).reverse();
    const scoreTrend = recentSessions.map((s) => ({
      date: formatDateInTz(s.createdAt, statsTz),
      score: Math.round(s.overallScore * 100),
      nLevel: s.nLevel,
    }));

    // Best scores by N-level
    const bestByLevel: Record<number, number> = {};
    for (const s of sessions) {
      if (!bestByLevel[s.nLevel] || s.overallScore > bestByLevel[s.nLevel]) {
        bestByLevel[s.nLevel] = s.overallScore;
      }
    }

    // Activity heatmap (last 12 weeks)
    const heatmap: Record<string, { count: number; avgScore: number }> = {};
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    for (const s of sessions) {
      if (s.createdAt >= twelveWeeksAgo) {
        const dateKey = formatDateInTz(s.createdAt, statsTz);
        if (!heatmap[dateKey]) {
          heatmap[dateKey] = { count: 0, avgScore: 0 };
        }
        heatmap[dateKey].count += 1;
        heatmap[dateKey].avgScore =
          (heatmap[dateKey].avgScore * (heatmap[dateKey].count - 1) + s.overallScore) /
          heatmap[dateKey].count;
      }
    }

    // Average score by stimulus type
    const stimulusScores: Record<string, { total: number; count: number }> = {};
    for (const s of sessions) {
      const results = s.results as Record<string, { hits: number; misses: number; falseAlarms: number }>;
      for (const [type, r] of Object.entries(results)) {
        if (!stimulusScores[type]) stimulusScores[type] = { total: 0, count: 0 };
        const total = r.hits + r.misses + r.falseAlarms;
        if (total > 0) {
          stimulusScores[type].total += r.hits / total;
          stimulusScores[type].count += 1;
        }
      }
    }
    const avgByStimulus: Record<string, number> = {};
    for (const [type, data] of Object.entries(stimulusScores)) {
      avgByStimulus[type] = data.count > 0 ? Math.round((data.total / data.count) * 100) : 0;
    }

    // Highest N-level played
    const highestNLevel = sessions.length > 0 ? Math.max(...sessions.map((s) => s.nLevel)) : 1;

    res.json({
      totalSessions: sessions.length,
      scoreTrend,
      bestByLevel,
      heatmap,
      avgByStimulus,
      highestNLevel,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/achievements - User's achievements
router.get('/achievements', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: profile.id },
      orderBy: { unlockedAt: 'desc' },
    });
    res.json(achievements);
  } catch (err) {
    console.error('Error fetching achievements:', err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// GET /api/daily-challenge - Today's challenge
router.get('/daily-challenge', async (req: Request, res: Response) => {
  const challengeTz = (req.query.tz as string) || 'UTC';
  const dateStr = formatDateInTz(new Date(), challengeTz);

  // Simple seeded random from date
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) & 0x7fffffff;
  }

  const seededRandom = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };

  const nLevels = [2, 2, 3, 3, 3, 4, 4, 5];
  const nLevel = nLevels[Math.floor(seededRandom() * nLevels.length)];

  const allStimuli = ['position', 'color', 'shape', 'number', 'audio'];
  const stimCount = Math.floor(seededRandom() * 3) + 2; // 2-4 stimuli
  const shuffled = [...allStimuli].sort(() => seededRandom() - 0.5);
  const activeStimuli = shuffled.slice(0, stimCount);

  // Approximate time until next challenge (client computes accurate local countdown)
  const endOfDay = new Date();
  endOfDay.setHours(24, 0, 0, 0);
  const timeUntilNext = endOfDay.getTime() - Date.now();

  res.json({
    nLevel,
    activeStimuli,
    trialCount: 25,
    intervalMs: 2500,
    timeUntilNext,
    dateKey: dateStr,
  });
});

// TEMPORARY DEBUG ENDPOINT - remove after fixing streak bug
router.get('/debug/streak', async (_req: Request, res: Response) => {
  try {
    const profiles = await prisma.userProfile.findMany({
      orderBy: { lastPlayedAt: 'desc' },
      take: 3,
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastPlayedAt: true,
        lastPlayedDate: true,
        streakFreezes: true,
      },
    });

    // Get recent sessions for each profile to see play dates
    const profilesWithSessions = await Promise.all(profiles.map(async (p) => {
      const sessions = await prisma.session.findMany({
        where: { userId: p.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { createdAt: true },
      });
      const sessionDatesUTC = sessions.map(s => s.createdAt.toISOString());
      const sessionDatesToronto = sessions.map(s => {
        try { return formatDateInTz(s.createdAt, 'America/Toronto'); }
        catch { return formatDateInTz(s.createdAt, 'UTC'); }
      });
      // Also format lastPlayedAt in Toronto tz
      const lastPlayedFormatted = p.lastPlayedAt
        ? (() => { try { return formatDateInTz(p.lastPlayedAt, 'America/Toronto'); } catch { return formatDateInTz(p.lastPlayedAt, 'UTC'); } })()
        : null;
      const lastPlayedType = p.lastPlayedAt === null ? 'null' : `${typeof p.lastPlayedAt} isDate=${p.lastPlayedAt instanceof Date}`;
      return { ...p, lastPlayedFormatted, lastPlayedType, sessionDatesUTC, sessionDatesToronto };
    }));

    const now = new Date();
    const todayToronto = formatDateInTz(now, 'America/Toronto');
    const yesterdayToronto = getYesterdayStr(todayToronto);

    const tzTest = {
      utcNow: now.toISOString(),
      formatUTC: formatDateInTz(now, 'UTC'),
      formatToronto: todayToronto,
      yesterdayToronto,
    };

    // Test if Intl timezone actually works or silently falls back
    const tzActuallyWorks = (() => {
      try {
        const utcHour = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', hour12: false }).format(now);
        const torontoHour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', hour: 'numeric', hour12: false }).format(now);
        const vancouverHour = (() => { try { return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Vancouver', hour: 'numeric', hour12: false }).format(now); } catch (e) { return `ERROR: ${e}`; } })();
        const vancouverDate = (() => { try { return formatDateInTz(now, 'America/Vancouver'); } catch (e) { return `ERROR: ${e}`; } })();
        // Test with the first profile's lastPlayedAt to see what old code would have computed
        const firstProfileLastPlayed = profiles[0]?.lastPlayedAt;
        const oldCodeTest = firstProfileLastPlayed ? (() => {
          const lpVancouver = (() => { try { return formatDateInTz(firstProfileLastPlayed, 'America/Vancouver'); } catch { return formatDateInTz(firstProfileLastPlayed, 'UTC'); } })();
          const lpUTC = formatDateInTz(firstProfileLastPlayed, 'UTC');
          return { lastPlayedAt: firstProfileLastPlayed.toISOString(), inVancouver: lpVancouver, inUTC: lpUTC };
        })() : null;
        return { utcHour, torontoHour, vancouverHour, vancouverDate, oldCodeTest };
      } catch (e) {
        return { error: String(e) };
      }
    })();

    res.json({ profiles: profilesWithSessions, tzTest, tzActuallyWorks, recentLogs: streakDebugLogs.slice(-20) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
