import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { roadmapsTable } from '../db/schema/index.js';
import { logger } from '../config/logger.js';
import type { IntakeSubmitInput } from '../schemas/intake.schema.js';
import type { RoadmapIdParam } from '../schemas/common.schema.js';

export const createIntake = async (_req: Request, res: Response): Promise<void> => {
  const { userId, rawIdea, sixWThreeH } = res.locals.body as IntakeSubmitInput;

  // TODO (Part 5): when sixWThreeH is omitted, call aiAgent.service to infer
  // the missing 6W3H fields from rawIdea instead of storing an empty summary.
  const sixW3hSummary = sixWThreeH ? JSON.stringify(sixWThreeH) : null;
  const title = rawIdea.slice(0, 80);

  const [roadmap] = await db
    .insert(roadmapsTable)
    .values({ userId, title, rawIdea, sixW3hSummary })
    .returning();

  logger.info({ roadmapId: roadmap?.id, userId }, 'New intake submitted, roadmap created');

  res.status(201).json({ roadmap });
};

export const getIntake = async (_req: Request, res: Response): Promise<void> => {
  const { roadmapId } = res.locals.params as RoadmapIdParam;

  const [roadmap] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.id, roadmapId));

  if (!roadmap) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Roadmap not found.' });
    return;
  }

  res.status(200).json({ roadmap });
};
