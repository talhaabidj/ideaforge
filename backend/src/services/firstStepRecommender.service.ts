import { callGeminiJson } from './geminiClient.js';
import type { Milestone } from '@prisma/client';

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

type MilestoneContext = Pick<Milestone, 'title' | 'description' | 'dayBucket'>;

export const recommendFirstStep = async (
  rawIdea: string,
  milestones: MilestoneContext[],
): Promise<FirstStepRecommendation> => {
  const milestoneSummary = milestones
    .map((m) => `[Day ${m.dayBucket}] ${m.title}${m.description ? ` - ${m.description}` : ''}`)
    .join('\n');

  return callGeminiJson<FirstStepRecommendation>({
    model: 'gemini-2.5-flash',
    system: SYSTEM_PROMPT,
    prompt: `Idea: "${rawIdea}"\n\nPlanned milestones:\n${milestoneSummary || 'None generated yet.'}`,
    maxTokens: 400,
  });
};
