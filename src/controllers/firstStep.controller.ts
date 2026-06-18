import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { roadmapsTable } from '../db/schema/index.js';
import type { RoadmapIdParam } from '../schemas/common.schema.js';

export const recommendFirstStep = async (_req: Request, res: Response): Promise<void> => {
  const { roadmapId } = res.locals.params as RoadmapIdParam;

  const [roadmap] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.id, roadmapId));

  if (!roadmap) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Roadmap not found.' });
    return;
  }

  // TODO (Part 5): call firstStepRecommender.service (Anthropic API) to scan
  // the roadmap's milestones and isolate the single smallest testable action.
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'First-step recommendation AI service lands in Part 5 — schema/route/DB wiring is ready.',
    roadmapId,
  });
};
