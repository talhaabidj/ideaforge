import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { roadmapsTable, assumptionsTable } from '../db/schema/index.js';
import type { RoadmapIdParam } from '../schemas/common.schema.js';

export const generateAssumptions = async (_req: Request, res: Response): Promise<void> => {
  const { roadmapId } = res.locals.params as RoadmapIdParam;

  const [roadmap] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.id, roadmapId));

  if (!roadmap) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Roadmap not found.' });
    return;
  }

  // TODO (Part 5): call assumptionExtractor.service (Anthropic API) with
  // roadmap.rawIdea / sixW3hSummary and insert the results into assumptionsTable.
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'Assumption extraction AI service lands in Part 5 — schema/route/DB wiring is ready.',
    roadmapId,
  });
};

export const listAssumptions = async (_req: Request, res: Response): Promise<void> => {
  const { roadmapId } = res.locals.params as RoadmapIdParam;

  const assumptions = await db
    .select()
    .from(assumptionsTable)
    .where(eq(assumptionsTable.roadmapId, roadmapId));

  res.status(200).json({ roadmapId, assumptions });
};
