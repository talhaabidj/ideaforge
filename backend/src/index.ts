import express, { type Response } from 'express';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import { inferSixWThreeH } from './services/aiAgent.service.js';
import { extractAssumptions } from './services/assumptionExtractor.service.js';
import { generateMilestones } from './services/milestoneGenerator.service.js';
import { recommendFirstStep } from './services/firstStepRecommender.service.js';
import { helmetMiddleware, corsMiddleware } from './middleware/security.js';
import { moderationMiddleware } from './middleware/moderation.js';
import { apiRateLimiter, aiRateLimiter } from './middleware/rateLimiter.js';
import { findOrCreateUser, readUserId, requireUser } from './middleware/session.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { validateRequest } from './utils/validateRequest.js';
import {
  assumptionGenerateBodySchema,
  assumptionStateBodySchema,
  firstStepBodySchema,
  idParamSchema,
  intakeBodySchema,
  milestoneGenerateBodySchema,
  type IntakeBody,
} from './schemas/index.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiRateLimiter);

const validId = validateRequest(idParamSchema, 'params');

// Checks run in this order on every route that sends user text to Gemini.
const aiGuards = [requireUser, aiRateLimiter, moderationMiddleware];

const currentUserId = (res: Response): string => res.locals.user.id;

// The :id route parameter after validId has checked it is a UUID.
const routeId = (res: Response): string => res.locals.params.id;

const findOwnedRoadmap = (roadmapId: string, userId: string) =>
  db.roadmap.findFirst({ where: { id: roadmapId, userId } });

// Gemini rate-limit errors carry status 429; everything else is a 500.
const sendAiError = (res: Response, error: unknown, message: string): void => {
  const status = (error as { status?: number })?.status;
  if (status === 429) {
    res.status(429).json({ error: (error as Error).message });
    return;
  }
  console.error(message, error);
  res.status(500).json({ error: message });
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/session', async (req, res, next) => {
  try {
    const user = await findOrCreateUser(readUserId(req));
    res.json({ userId: user.id, name: user.name, email: user.email });
  } catch (error) {
    next(error);
  }
});

app.get('/api/roadmaps', requireUser, async (_req, res) => {
  const roadmaps = await db.roadmap.findMany({
    where: { userId: currentUserId(res) },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { assumptions: true, milestones: true } } },
  });
  if (roadmaps.length === 0) {
    res.status(404).json({ error: 'No roadmaps' });
    return;
  }
  res.json({ roadmaps });
});

app.post('/api/intake', validateRequest(intakeBodySchema), ...aiGuards, async (_req, res) => {
  try {
    const { rawIdea, sixWThreeH } = res.locals.body as IntakeBody;
    const finalSixW3H = await inferSixWThreeH(rawIdea, sixWThreeH ?? {});
    const roadmap = await db.roadmap.create({
      data: {
        userId: currentUserId(res),
        title: rawIdea.slice(0, 80),
        rawIdea,
        sixW3hSummary: JSON.stringify(finalSixW3H),
        status: 'draft',
      },
    });
    res.json({ roadmap });
  } catch (error) {
    sendAiError(res, error, 'Failed to process intake');
  }
});

app.get('/api/intake/:id', validId, requireUser, async (_req, res) => {
  const roadmap = await findOwnedRoadmap(routeId(res), currentUserId(res));
  if (!roadmap) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ roadmap });
});

app.get('/api/assumptions/:id', validId, requireUser, async (_req, res) => {
  const assumptions = await db.assumption.findMany({
    where: { roadmapId: routeId(res), roadmap: { userId: currentUserId(res) } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ assumptions });
});

app.post(
  '/api/assumptions/:id/generate',
  validId,
  validateRequest(assumptionGenerateBodySchema),
  ...aiGuards,
  async (_req, res) => {
    try {
      const roadmap = await findOwnedRoadmap(routeId(res), currentUserId(res));
      if (!roadmap) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const inferred = await extractAssumptions(roadmap.rawIdea, roadmap.sixW3hSummary);
      await db.assumption.createMany({
        data: inferred.map((a) => ({
          roadmapId: roadmap.id,
          statement: a.statement,
          riskLevel: a.riskLevel,
          isValidated: 'pending',
        })),
      });
      const created = await db.assumption.findMany({
        where: { roadmapId: roadmap.id },
        orderBy: { createdAt: 'desc' },
      });
      await db.roadmap.update({ where: { id: roadmap.id }, data: { status: 'assumptions' } });
      res.json({ assumptions: created });
    } catch (error) {
      sendAiError(res, error, 'Failed to generate assumptions');
    }
  },
);

app.patch(
  '/api/assumptions/validate/:id',
  validId,
  validateRequest(assumptionStateBodySchema),
  requireUser,
  async (_req, res) => {
    const owned = await db.assumption.findFirst({
      where: { id: routeId(res), roadmap: { userId: currentUserId(res) } },
    });
    if (!owned) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const assumption = await db.assumption.update({
      where: { id: owned.id },
      data: { isValidated: res.locals.body.state },
    });
    res.json({ assumption });
  },
);

app.get('/api/milestones/:id', validId, requireUser, async (_req, res) => {
  const milestones = await db.milestone.findMany({
    where: { roadmapId: routeId(res), roadmap: { userId: currentUserId(res) } },
    orderBy: [{ dayBucket: 'asc' }, { orderIndex: 'asc' }],
  });
  res.json({ milestones });
});

app.post(
  '/api/milestones/:id/generate',
  validId,
  validateRequest(milestoneGenerateBodySchema),
  ...aiGuards,
  async (_req, res) => {
    try {
      const roadmap = await findOwnedRoadmap(routeId(res), currentUserId(res));
      if (!roadmap) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const generated = await generateMilestones(roadmap.rawIdea, roadmap.sixW3hSummary);
      await db.milestone.createMany({
        data: generated.map((m, i) => ({
          roadmapId: roadmap.id,
          title: m.title,
          description: m.description,
          dayBucket: m.dayBucket,
          orderIndex: i,
          isAccepted: false,
        })),
      });
      const created = await db.milestone.findMany({
        where: { roadmapId: roadmap.id },
        orderBy: [{ dayBucket: 'asc' }, { orderIndex: 'asc' }],
      });
      await db.roadmap.update({ where: { id: roadmap.id }, data: { status: 'milestones' } });
      res.json({ milestones: created });
    } catch (error) {
      sendAiError(res, error, 'Failed to generate milestones');
    }
  },
);

app.patch('/api/milestones/:id/accept', validId, requireUser, async (_req, res) => {
  const owned = await db.milestone.findFirst({
    where: { id: routeId(res), roadmap: { userId: currentUserId(res) } },
  });
  if (!owned) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const milestone = await db.milestone.update({
    where: { id: owned.id },
    data: { isAccepted: true, acceptedAt: new Date() },
  });
  res.json({ milestone });
});

app.get('/api/first-step/:id', validId, requireUser, async (_req, res) => {
  const firstSteps = await db.firstStep.findMany({
    where: { roadmapId: routeId(res), roadmap: { userId: currentUserId(res) } },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  res.json({ firstStep: firstSteps[0] || null });
});

app.post(
  '/api/first-step/:id/recommend',
  validId,
  validateRequest(firstStepBodySchema),
  ...aiGuards,
  async (_req, res) => {
    try {
      const roadmap = await findOwnedRoadmap(routeId(res), currentUserId(res));
      if (!roadmap) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const milestones = await db.milestone.findMany({ where: { roadmapId: roadmap.id } });
      const recommended = await recommendFirstStep(roadmap.rawIdea, milestones);
      const step = await db.firstStep.create({
        data: {
          roadmapId: roadmap.id,
          action: recommended.action,
          rationale: recommended.rationale,
          estimatedTimeHours: recommended.estimatedTimeHours,
        },
      });
      await db.roadmap.update({ where: { id: roadmap.id }, data: { status: 'complete' } });
      res.json({ firstStep: step });
    } catch (error) {
      sendAiError(res, error, 'Failed to recommend first step');
    }
  },
);

app.delete('/api/roadmaps/:id', validId, requireUser, async (_req, res) => {
  const { count } = await db.roadmap.deleteMany({
    where: { id: routeId(res), userId: currentUserId(res) },
  });
  if (count === 0) {
    res.status(404).json({ error: 'Roadmap not found' });
    return;
  }
  res.json({ deleted: true, id: routeId(res) });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
