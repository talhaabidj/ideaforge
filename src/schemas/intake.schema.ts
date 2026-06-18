import { z } from 'zod';

// All 9 fields are optional at the schema level because the chatbot can
// drive the conversation turn-by-turn on the frontend; whatever the user
// hasn't answered yet, the Part 5 AI agent will infer from rawIdea.
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

export const intakeSubmitSchema = z.object({
  userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
  rawIdea: z
    .string()
    .trim()
    .min(10, 'rawIdea must be at least 10 characters')
    .max(2000, 'rawIdea must be under 2000 characters'),
  sixWThreeH: sixWThreeHSchema.optional(),
});

export type SixWThreeH = z.infer<typeof sixWThreeHSchema>;
export type IntakeSubmitInput = z.infer<typeof intakeSubmitSchema>;
