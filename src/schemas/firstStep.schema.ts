import { z } from 'zod';

export const firstStepGenerateBodySchema = z.object({
  // Optional hint pointing the AI (Part 5) at a specific milestone to derive
  // the smallest testable action from, instead of scanning the whole roadmap.
  focusMilestoneId: z.string().uuid().optional(),
});

export type FirstStepGenerateInput = z.infer<typeof firstStepGenerateBodySchema>;
