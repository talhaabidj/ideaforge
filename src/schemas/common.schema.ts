import { z } from 'zod';

export const roadmapIdParamSchema = z.object({
  roadmapId: z.string().uuid({ message: 'roadmapId must be a valid UUID' }),
});

export const milestoneIdParamSchema = z.object({
  milestoneId: z.string().uuid({ message: 'milestoneId must be a valid UUID' }),
});

export type RoadmapIdParam = z.infer<typeof roadmapIdParamSchema>;
export type MilestoneIdParam = z.infer<typeof milestoneIdParamSchema>;
