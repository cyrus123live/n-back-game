import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { getAuth } from '@clerk/express';

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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let streakBroken = false;
    if (profile.lastPlayedAt && profile.lastPlayedAt < yesterday && profile.currentStreak > 0) {
      // Check if more than 1 day gap
      const daysDiff = Math.floor((today.getTime() - profile.lastPlayedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        streakBroken = true;
        await prisma.userProfile.update({
          where: { id: profile.id },
          data: { currentStreak: 0 },
        });
        profile.currentStreak = 0;
      }
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

    const sessions = await prisma.session.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Score trend over last 30 sessions
    const recentSessions = sessions.slice(0, 30).reverse();
    const scoreTrend = recentSessions.map((s) => ({
      date: s.createdAt.toISOString().split('T')[0],
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
        const dateKey = s.createdAt.toISOString().split('T')[0];
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
router.get('/daily-challenge', async (_req: Request, res: Response) => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

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

  // Calculate time until next challenge (midnight)
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const timeUntilNext = tomorrow.getTime() - Date.now();

  res.json({
    nLevel,
    activeStimuli,
    trialCount: 25,
    intervalMs: 2500,
    timeUntilNext,
    dateKey: dateStr,
  });
});

export default router;
