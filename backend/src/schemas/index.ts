import { z } from "zod";

// Mirrors the teammate's Zod schemas exactly (src/schemas/*). Keeping the
// contract identical means the frontend + API route layer are a faithful
// reimplementation of the Express backend.

const sixWThreeHSchema = z
  .object({
    who: z.string().trim().min(1).max(500),
    what: z.string().trim().min(1).max(500),
    where: z.string().trim().min(1).max(500),
    when: z.string().trim().min(1).max(500),
    why: z.string().trim().min(1).max(500),
    which: z.string().trim().min(1).max(500),
    how: z.string().trim().min(1).max(500),
    howMuch: z.string().trim().min(1).max(500),
    howMany: z.string().trim().min(1).max(500),
  })
  .partial();

export type SixWThreeH = z.infer<typeof sixWThreeHSchema>;

export const intakeSubmitSchema = z.object({
  userId: z.string().uuid({ message: "userId must be a valid UUID" }),
  rawIdea: z
    .string()
    .trim()
    .min(10, "rawIdea must be at least 10 characters")
    .max(2000, "rawIdea must be under 2000 characters"),
  sixWThreeH: sixWThreeHSchema.optional(),
});

export type IntakeSubmitInput = z.infer<typeof intakeSubmitSchema>;

export const assumptionGenerateBodySchema = z.object({
  focusHint: z.string().trim().max(500).optional(),
});

export type AssumptionGenerateInput = z.infer<typeof assumptionGenerateBodySchema>;

export const milestoneGenerateBodySchema = z.object({
  constraints: z.string().trim().max(500).optional(),
});

export type MilestoneGenerateInput = z.infer<typeof milestoneGenerateBodySchema>;

export const firstStepGenerateBodySchema = z.object({
  focusMilestoneId: z.string().uuid().optional(),
});

export type FirstStepGenerateInput = z.infer<typeof firstStepGenerateBodySchema>;

export const roadmapIdParamSchema = z.object({
  roadmapId: z.string().uuid({ message: "roadmapId must be a valid UUID" }),
});

export const milestoneIdParamSchema = z.object({
  milestoneId: z.string().uuid({ message: "milestoneId must be a valid UUID" }),
});
