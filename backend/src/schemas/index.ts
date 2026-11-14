import { z } from "zod";

// Request shapes for every route that takes input. The server rejects
// anything else with a 400 before it reaches the database or Gemini.

const answerSchema = z.string().trim().min(1).max(500);

export const sixWThreeHSchema = z
  .object({
    who: answerSchema,
    what: answerSchema,
    where: answerSchema,
    when: answerSchema,
    why: answerSchema,
    which: answerSchema,
    how: answerSchema,
    howMuch: answerSchema,
    howMany: answerSchema,
  })
  .partial();

export type SixWThreeH = z.infer<typeof sixWThreeHSchema>;

export const intakeBodySchema = z.object({
  rawIdea: z
    .string()
    .trim()
    .min(10, "rawIdea must be at least 10 characters")
    .max(2000, "rawIdea must be under 2000 characters"),
  sixWThreeH: sixWThreeHSchema.optional(),
});

export type IntakeBody = z.infer<typeof intakeBodySchema>;

export const assumptionGenerateBodySchema = z.object({
  focusHint: z.string().trim().max(500).optional(),
});

export const milestoneGenerateBodySchema = z.object({
  constraints: z.string().trim().max(500).optional(),
});

export const firstStepBodySchema = z.object({
  focusMilestoneId: z.string().uuid().optional(),
});

export const assumptionStateBodySchema = z.object({
  state: z.enum(["validated", "invalidated"]),
});

export const idParamSchema = z.object({
  id: z.string().uuid({ message: "id must be a valid UUID" }),
});
