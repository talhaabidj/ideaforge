/**
 * @file assumptionExtractor.service.ts
 * @description Stage 2 AI Agent — Risk Analyst
 *
 * Surfaces the 3-5 riskiest unvalidated assumptions a founder is implicitly
 * making about their idea. Each assumption is tagged with a risk level
 * (low / medium / high) to help prioritize validation efforts.
 *
 * Focuses on: customer demand, willingness to pay, distribution channels,
 * regulatory constraints, and operational feasibility.
 *
 * @see ARCHITECTURE.md — Stage 2 data flow
 */

import { callModelJson } from "../ai";

// Mirrors the teammate's `services/assumptionExtractor.service.ts`.

export type ExtractedAssumption = {
  statement: string;
  riskLevel: "low" | "medium" | "high";
};

const SYSTEM_PROMPT = `You are a risk analyst for early-stage startup ideas. Given
an idea description, surface the 3 to 5 riskiest, unvalidated assumptions the
founder is implicitly making - the beliefs that, if wrong, would sink the idea.
Prioritize assumptions about customer demand, willingness to pay, and
distribution over generic platitudes like "people will like this".
Respond ONLY with a JSON array of objects shaped exactly like:
[{"statement": string, "riskLevel": "low" | "medium" | "high"}, ...].
No preamble, no markdown fences.`;

export const extractAssumptions = async (
  rawIdea: string,
  sixW3hSummary: string | null,
  focusHint?: string,
): Promise<ExtractedAssumption[]> => {
  const context = [
    sixW3hSummary ? `\n\n6W3H context: ${sixW3hSummary}` : "",
    focusHint ? `\n\nAnalyst focus: ${focusHint}` : "",
  ].join("");

  const assumptions = await callModelJson<ExtractedAssumption[]>({
    system: SYSTEM_PROMPT,
    prompt: `Idea: "${rawIdea}"${context}`,
  });

  return assumptions
    .filter((a) => a && typeof a.statement === "string")
    .map((a) => ({
      statement: a.statement,
      riskLevel: ["low", "medium", "high"].includes(a.riskLevel)
        ? a.riskLevel
        : "medium",
    }))
    .slice(0, 5);
};
