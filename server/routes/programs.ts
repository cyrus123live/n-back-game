import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { getAuth } from '@clerk/express';
import { isValidTemplateId, TEMPLATE_TOTAL_DAYS, DEFAULT_REQUIRED_SCORE, SKIP_THRESHOLD, getSkipTarget } from '../lib/programs.js';

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

// GET /api/programs - List user's programs
router.get('/', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const programs = await prisma.trainingProgram.findMany({
      where: { userId: profile.id },
      orderBy: { startedAt: 'desc' },
    });

    res.json({ programs });
  } catch (err) {
    console.error('Error fetching programs:', err);
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// POST /api/programs/enroll - Enroll in a program
router.post('/enroll', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const { templateId } = req.body;

    if (!isValidTemplateId(templateId)) {
      return res.status(400).json({ error: 'Invalid template' });
    }

    // Check for active duplicate
    const existing = await prisma.trainingProgram.findFirst({
      where: { userId: profile.id, templateId, status: 'active' },
    });
    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this program' });
    }

    const program = await prisma.trainingProgram.create({
      data: {
        userId: profile.id,
        templateId,
      },
    });

    res.json({ program });
  } catch (err) {
    console.error('Error enrolling in program:', err);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// POST /api/programs/:id/complete-session - Complete a session in a program
router.post('/:id/complete-session', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const programId = req.params.id as string;
    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId },
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });
    if (program.userId !== profile.id) return res.status(403).json({ error: 'Forbidden' });
    if (program.status !== 'active') return res.status(400).json({ error: 'Program is not active' });

    const { sessionId, score } = req.body;
    const requiredScore = DEFAULT_REQUIRED_SCORE;

    // Check if score meets the requirement
    const passed = score == null || score >= requiredScore;

    if (!passed) {
      return res.json({
        program,
        completed: false,
        passed: false,
        requiredScore,
      });
    }

    // Score passed - compute advancement
    const completedSessions = Array.isArray(program.completedSessions)
      ? [...(program.completedSessions as string[]), sessionId]
      : [sessionId];

    let nextDay = program.currentDay + 1;
    let skippedTo: number | undefined;

    // Check for skip opportunity
    if (score != null && score >= SKIP_THRESHOLD) {
      const skipTarget = getSkipTarget(program.templateId, program.currentDay);
      if (skipTarget > nextDay) {
        skippedTo = skipTarget;
        nextDay = skipTarget;
      }
    }

    const totalDays = TEMPLATE_TOTAL_DAYS[program.templateId] || 20;
    const isComplete = nextDay > totalDays;

    const updated = await prisma.trainingProgram.update({
      where: { id: program.id },
      data: {
        currentDay: isComplete ? totalDays : nextDay,
        completedSessions,
        ...(isComplete ? { status: 'completed', completedAt: new Date() } : {}),
      },
    });

    res.json({
      program: updated,
      completed: isComplete,
      passed: true,
      skippedTo,
      requiredScore,
    });
  } catch (err) {
    console.error('Error completing session:', err);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// DELETE /api/programs/:id - Abandon a program
router.delete('/:id', async (req: Request, res: Response) => {
  const clerkUserId = getClerkUserId(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await getOrCreateProfile(clerkUserId);
    const programId = req.params.id as string;
    const program = await prisma.trainingProgram.findUnique({
      where: { id: programId },
    });

    if (!program) return res.status(404).json({ error: 'Program not found' });
    if (program.userId !== profile.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.trainingProgram.update({
      where: { id: program.id },
      data: { status: 'abandoned' },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error abandoning program:', err);
    res.status(500).json({ error: 'Failed to abandon program' });
  }
});

export default router;
