import { callGeminiJson } from './geminiClient.js';

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

// The second "expensive reasoning agent" (planning doc, Section 4) - guarded
// by the moderation middleware and the per-IP roadmap generation limiter.
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
    .join('\n\n');

  return callGeminiJson<GeneratedMilestone[]>({
    model: 'gemini-2.5-flash',
    system: SYSTEM_PROMPT,
    prompt: `Idea: "${rawIdea}"${context ? `\n\n${context}` : ''}`,
    maxTokens: 8192,
  });
};
