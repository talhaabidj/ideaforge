import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { roadmapsTable, milestonesTable } from '../db/schema/index.js';
import type { RoadmapIdParam, MilestoneIdParam } from '../schemas/common.schema.js';

export const generateMilestones = async (_req: Request, res: Response): Promise<void> => {
  const { roadmapId } = res.locals.params as RoadmapIdParam;

  const [roadmap] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.id, roadmapId));

  if (!roadmap) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Roadmap not found.' });
    return;
  }

  // TODO (Part 5): call milestoneGenerator.service (Anthropic API) to synthesize
  // a chronological 30/60/90-day plan and insert rows into milestonesTable.
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message: 'Milestone generation AI service lands in Part 5 — schema/route/DB wiring is ready.',
    roadmapId,
  });
};

export const listMilestones = async (_req: Request, res: Response): Promise<void> => {
  const { roadmapId } = res.locals.params as RoadmapIdParam;

  const milestones = await db
    .select()
    .from(milestonesTable)
    .where(eq(milestonesTable.roadmapId, roadmapId))
    .orderBy(milestonesTable.dayBucket, milestonesTable.orderIndex);

  res.status(200).json({ roadmapId, milestones });
};

// HITL safeguard (planning doc, Section 7): the AI only ever proposes a draft —
// a milestone is treated as committed only after the user explicitly accepts it.
export const acceptMilestone = async (_req: Request, res: Response): Promise<void> => {
  const { milestoneId } = res.locals.params as MilestoneIdParam;

  const [updated] = await db
    .update(milestonesTable)
    .set({ isAccepted: true, acceptedAt: new Date() })
    .where(eq(milestonesTable.id, milestoneId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Milestone not found.' });
    return;
  }

  res.status(200).json({ milestone: updated });
};
