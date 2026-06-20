/**
 * @file aiAgent.service.ts
 * @description Stage 1 AI Agent — 6W3H Intake Chatbot
 *
 * Structures a raw startup idea across the 9-field 6W3H framework:
 * Who, What, Where, When, Why, Which, How, How much, How many.
 *
 * KEY DESIGN DECISION: AI inferences NEVER overwrite user-provided values.
 * The spread order `{ ...aiInferred, ...userProvided }` ensures user input
 * always takes precedence. This is a core Responsible AI requirement.
 *
 * @see RESPONSIBLE_AI.md — "Never overwrite user input" guardrail
 */

import { callModelJson } from "../ai";
import type { SixWThreeH } from "../schemas/index";

// Mirrors the teammate's `services/aiAgent.service.ts` (inferSixWThreeH).
// Only calls the AI for fields the user actually left blank; anything the
// user typed is trusted as-is and never overwritten by a guess.

const SIX_W_3H_FIELDS = [
  "who",
  "what",
  "where",
  "when",
  "why",
  "which",
  "how",
  "howMuch",
  "howMany",
] as const;

const SYSTEM_PROMPT = `You are an intake analyst for a startup idea planning tool.
Given a raw idea description, infer the missing fields of the 6W3H framework
(who, what, where, when, why, which, how, howMuch, howMany). Make reasonable
inferences from context. If a field is genuinely unknowable from the text,
respond with "Not specified - needs founder input" for that field.
Respond ONLY with a JSON object containing exactly the requested keys as
strings. No preamble, no markdown fences, no extra keys.`;

export const inferSixWThreeH = async (
  rawIdea: string,
  partial: SixWThreeH = {},
): Promise<SixWThreeH> => {
  const missingFields = SIX_W_3H_FIELDS.filter((field) => !partial[field]);

  if (missingFields.length === 0) {
    return partial;
  }

  const inferred = await callModelJson<SixWThreeH>({
    system: SYSTEM_PROMPT,
    prompt: `Raw idea: "${rawIdea}"\n\nFields needed: ${missingFields.join(", ")}`,
  });

  // Spread order matters: AI fills gaps first, then user-provided values
  // overwrite them, guaranteeing user input always wins.
  const cleaned: SixWThreeH = {};
  for (const field of SIX_W_3H_FIELDS) {
    const value = (inferred as Record<string, unknown>)[field];
    if (typeof value === "string" && value.trim()) {
      cleaned[field] = value.trim();
    }
  }
  return { ...cleaned, ...partial };
};
