/**
 * @file milestoneGenerator.service.ts
 * @description Stage 3 AI Agent — Execution Coach
 *
 * Synthesizes a chronological 30/60/90-day milestone roadmap for a startup
 * idea. Produces 3-5 concrete, achievable milestones per day bucket.
 *
 * CRITICAL: The AI only PROPOSES milestones — every milestone stays in a
 * draft state (isAccepted: false) until the user explicitly accepts it via
 * the HITL (Human-in-the-Loop) accept endpoint. This is the centerpiece
 * of our Responsible AI design.
 *
 * @see RESPONSIBLE_AI.md — HITL Implementation section
 */

import { callModelJson } from "../ai";

// Mirrors the teammate's `services/milestoneGenerator.service.ts`.

export type GeneratedMilestone = {
  title: string;
  description: string;
  dayBucket: 30 | 60 | 90;
  orderIndex: number;
};

const SYSTEM_PROMPT = `You are a startup execution coach. Given an idea
description, synthesize a realistic, chronological 30/60/90-day roadmap.
Each milestone must be concrete and achievable by a solo founder or small
team - avoid vague goals like "grow the business" or "build a community".
Produce 3 to 5 milestones per day-bucket (30, 60, 90), ordered chronologically
within each bucket via orderIndex starting at 0.
Respond ONLY with a JSON array of objects shaped exactly like:
[{"title": string, "description": string, "dayBucket": 30 | 60 | 90,
"orderIndex": number}, ...]. No preamble, no markdown fences.`;

export const generateMilestones = async (
  rawIdea: string,
  sixW3hSummary: string | null,
  constraints?: string,
): Promise<GeneratedMilestone[]> => {
  const context = [
    sixW3hSummary ? `6W3H context: ${sixW3hSummary}` : null,
    constraints ? `Real-world constraints: ${constraints}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const milestones = await callModelJson<GeneratedMilestone[]>({
    system: SYSTEM_PROMPT,
    prompt: `Idea: "${rawIdea}"${context ? `\n\n${context}` : ""}`,
  });

  return milestones
    .filter((m) => m && typeof m.title === "string")
    .map((m) => ({
      title: m.title,
      description: typeof m.description === "string" ? m.description : "",
      dayBucket: [30, 60, 90].includes(m.dayBucket) ? m.dayBucket : 30,
      orderIndex: Number.isFinite(m.orderIndex) ? m.orderIndex : 0,
    }));
};
