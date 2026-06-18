import { z } from 'zod';

export const milestoneGenerateBodySchema = z.object({
  // Optional real-world constraints (time/budget/team size) for the AI (Part 5)
  // to factor into the 30/60/90-day plan.
  constraints: z.string().trim().max(500).optional(),
});

export type MilestoneGenerateInput = z.infer<typeof milestoneGenerateBodySchema>;
