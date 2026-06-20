/**
 * @file firstStepRecommender.service.ts
 * @description Stage 4 AI Agent — Paralysis Breaker
 *
 * Isolates the SINGLE smallest testable action the founder can take in the
 * next 24 hours to get real signal about their riskiest assumption.
 *
 * Constraints enforced via prompt engineering:
 * - Must be completable in 24-48 hours
 * - Requires zero budget
 * - Requires no team (solo-executable)
 * - Must produce observable, real-world signal (not just more research)
 *
 * @see ARCHITECTURE.md — Stage 4 data flow
 */

import { callModelJson } from "../ai";

// Mirrors the teammate's `services/firstStepRecommender.service.ts`.

export type FirstStepRecommendation = {
  action: string;
  rationale: string;
  estimatedTimeHours: number;
};

const SYSTEM_PROMPT = `You are an execution-paralysis breaker for early-stage
founders. Given a startup idea and its planned milestones, isolate the SINGLE
smallest possible testable action the founder could take in the next 24-48
hours - something requiring no budget and no team, that produces real signal
about the riskiest assumption underlying the idea.
Respond ONLY with JSON shaped exactly like: {"action": string, "rationale":
string, "estimatedTimeHours": number}. No preamble, no markdown fences.`;

type MilestoneContext = { title: string; description: string | null; dayBucket: number };

export const recommendFirstStep = async (
  rawIdea: string,
  milestones: MilestoneContext[],
): Promise<FirstStepRecommendation> => {
  const milestoneSummary = milestones
    .map((m) => `[Day ${m.dayBucket}] ${m.title}${m.description ? ` - ${m.description}` : ""}`)
    .join("\n");

  const result = await callModelJson<FirstStepRecommendation>({
    system: SYSTEM_PROMPT,
    prompt: `Idea: "${rawIdea}"\n\nPlanned milestones:\n${milestoneSummary || "None generated yet."}`,
  });

  return {
    action: typeof result.action === "string" ? result.action : "",
    rationale: typeof result.rationale === "string" ? result.rationale : "",
    estimatedTimeHours: Number.isFinite(result.estimatedTimeHours)
      ? result.estimatedTimeHours
      : 2,
  };
};
