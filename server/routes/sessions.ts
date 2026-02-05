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

// POST /api/sessions - Save a completed session
router.post('/', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const { nLevel, activeStimuli, trialCount, intervalMs, results, overallScore, xpEarned, maxCombo, adaptive, startingLevel, endingLevel, levelChanges } = req.body;

    // Check if first play of the day
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isFirstPlayToday = !profile.lastPlayedAt || profile.lastPlayedAt < today;

    // Apply daily first-play bonus
    const finalXp = isFirstPlayToday ? Math.round(xpEarned * 1.5) : xpEarned;

    // Update streak
    let newStreak = profile.currentStreak;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isFirstPlayToday) {
      if (profile.lastPlayedAt && profile.lastPlayedAt >= yesterday) {
        newStreak += 1;
      } else if (!profile.lastPlayedAt || profile.lastPlayedAt < yesterday) {
        // Streak broken - check for freeze
        if (profile.streakFreezes > 0 && profile.lastPlayedAt) {
          // Use a streak freeze
          await prisma.userProfile.update({
            where: { id: profile.id },
            data: { streakFreezes: { decrement: 1 } },
          });
        } else {
          newStreak = 1;
        }
      }
    }

    const longestStreak = Math.max(profile.longestStreak, newStreak);

    // Earn streak freeze every 7-day streak
    const earnedFreeze = newStreak > 0 && newStreak % 7 === 0 && newStreak !== profile.currentStreak;

    // Calculate new level
    const newTotalXp = profile.xp + finalXp;
    const newLevel = calculateLevel(newTotalXp);

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: profile.id,
        nLevel,
        activeStimuli,
        trialCount,
        intervalMs,
        results,
        overallScore,
        xpEarned: finalXp,
        maxCombo: maxCombo || 0,
        adaptive: adaptive || false,
        startingLevel: startingLevel ?? null,
        endingLevel: endingLevel ?? null,
        levelChanges: levelChanges ?? null,
      },
    });

    // Update profile
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        xp: newTotalXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak,
        lastPlayedAt: now,
        ...(earnedFreeze ? { streakFreezes: { increment: 1 } } : {}),
      },
    });

    // Check achievements (use endingLevel for adaptive sessions)
    const effectiveNLevel = adaptive && endingLevel ? endingLevel : nLevel;
    const newAchievements = await checkAchievements(profile.id, {
      sessionCount: await prisma.session.count({ where: { userId: profile.id } }),
      currentStreak: newStreak,
      overallScore,
      nLevel: effectiveNLevel,
      activeStimuli,
      maxCombo: maxCombo || 0,
      level: newLevel,
      totalXp: newTotalXp,
    });

    const leveledUp = newLevel > profile.level;

    res.json({
      session,
      xpEarned: finalXp,
      isFirstPlayToday,
      newLevel,
      leveledUp,
      newStreak,
      newAchievements,
      earnedFreeze,
    });
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// GET /api/sessions - Session history
router.get('/', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId: profile.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.session.count({ where: { userId: profile.id } }),
    ]);

    res.json({ sessions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

function calculateLevel(totalXp: number): number {
  // Accelerating curve: 100, 250, 500, 850, 1300, 1900, 2700, 3800, 5200...
  const thresholds = [0];
  let threshold = 0;
  for (let i = 1; i <= 50; i++) {
    threshold += 100 + (i - 1) * 50;
    thresholds.push(threshold);
  }
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (totalXp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
}

interface AchievementCheckData {
  sessionCount: number;
  currentStreak: number;
  overallScore: number;
  nLevel: number;
  activeStimuli: string[];
  maxCombo: number;
  level: number;
  totalXp: number;
}

const ACHIEVEMENTS = [
  { id: 'first_steps', check: (d: AchievementCheckData) => d.sessionCount >= 1 },
  { id: 'getting_warmed_up', check: (d: AchievementCheckData) => d.sessionCount >= 10 },
  { id: 'centurion', check: (d: AchievementCheckData) => d.sessionCount >= 100 },
  { id: 'dedicated_7', check: (d: AchievementCheckData) => d.currentStreak >= 7 },
  { id: 'committed_14', check: (d: AchievementCheckData) => d.currentStreak >= 14 },
  { id: 'unstoppable_30', check: (d: AchievementCheckData) => d.currentStreak >= 30 },
  { id: 'legendary_60', check: (d: AchievementCheckData) => d.currentStreak >= 60 },
  { id: 'immortal_100', check: (d: AchievementCheckData) => d.currentStreak >= 100 },
  { id: 'sharp_mind', check: (d: AchievementCheckData) => d.overallScore >= 0.9 && d.nLevel >= 3 },
  { id: 'perfectionist', check: (d: AchievementCheckData) => d.overallScore >= 1.0 },
  { id: 'triple_threat', check: (d: AchievementCheckData) => d.nLevel >= 3 },
  { id: 'quad_core', check: (d: AchievementCheckData) => d.nLevel >= 4 },
  { id: 'quintuple_threat', check: (d: AchievementCheckData) => d.activeStimuli.length >= 5 },
  { id: 'combo_starter', check: (d: AchievementCheckData) => d.maxCombo >= 5 },
  { id: 'combo_master', check: (d: AchievementCheckData) => d.maxCombo >= 10 },
  { id: 'combo_king', check: (d: AchievementCheckData) => d.maxCombo >= 15 },
  { id: 'combo_legend', check: (d: AchievementCheckData) => d.maxCombo >= 20 },
  { id: 'level_5', check: (d: AchievementCheckData) => d.level >= 5 },
  { id: 'level_10', check: (d: AchievementCheckData) => d.level >= 10 },
  { id: 'level_15', check: (d: AchievementCheckData) => d.level >= 15 },
  { id: 'level_20', check: (d: AchievementCheckData) => d.level >= 20 },
  { id: 'grandmaster', check: (d: AchievementCheckData) => d.level >= 25 },
  { id: 'dual_mode', check: (d: AchievementCheckData) => d.activeStimuli.length >= 2 },
  { id: 'triple_mode', check: (d: AchievementCheckData) => d.activeStimuli.length >= 3 },
  { id: 'quad_mode', check: (d: AchievementCheckData) => d.activeStimuli.length >= 4 },
  { id: 'high_scorer', check: (d: AchievementCheckData) => d.overallScore >= 0.95 && d.nLevel >= 2 },
  { id: 'marathon', check: (d: AchievementCheckData) => d.sessionCount >= 50 },
  { id: 'five_back', check: (d: AchievementCheckData) => d.nLevel >= 5 },
  { id: 'brain_warm', check: (d: AchievementCheckData) => d.sessionCount >= 5 },
  { id: 'xp_hunter', check: (d: AchievementCheckData) => d.totalXp >= 1000 },
];

async function checkAchievements(userId: string, data: AchievementCheckData): Promise<string[]> {
  const existing = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const existingIds = new Set(existing.map((a) => a.achievementId));

  const newAchievements: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!existingIds.has(achievement.id) && achievement.check(data)) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newAchievements.push(achievement.id);
    }
  }

  return newAchievements;
}

// DELETE /api/sessions/:id - Delete a session
router.delete('/:id', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const sessionId = req.params.id as string;
    const session = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== profile.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.session.delete({ where: { id: sessionId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
