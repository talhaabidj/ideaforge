import { z } from 'zod';

export const assumptionGenerateBodySchema = z.object({
  // Optional steer for the AI (Part 5), e.g. "focus on pricing risk".
  focusHint: z.string().trim().max(500).optional(),
});

export type AssumptionGenerateInput = z.infer<typeof assumptionGenerateBodySchema>;
