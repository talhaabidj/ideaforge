import { callGeminiJson } from './geminiClient.js';

export type ExtractedAssumption = {
  statement: string;
  riskLevel: 'low' | 'medium' | 'high';
};

const SYSTEM_PROMPT = `You are a risk analyst for early-stage startup ideas. Given
an idea description, surface the 3 to 5 riskiest, unvalidated assumptions the
founder is implicitly making - the beliefs that, if wrong, would sink the idea.
Prioritize assumptions about customer demand, willingness to pay, and
distribution over generic platitudes like "people will like this".
Respond ONLY with a JSON array of objects shaped exactly like:
[{"statement": string, "riskLevel": "low" | "medium" | "high"}, ...].
No preamble, no markdown fences.`;

// This is one of the two "expensive reasoning agents" the planning doc refers
// to (Section 4) — moderation runs before this is ever called, and the
// roadmap-generation rate limiter caps how often it can be hit per IP.
export const extractAssumptions = async (
  rawIdea: string,
  sixW3hSummary: string | null,
): Promise<ExtractedAssumption[]> => {
  const context = sixW3hSummary ? `\n\n6W3H context: ${sixW3hSummary}` : '';

  const assumptions = await callGeminiJson<ExtractedAssumption[]>({
    model: 'gemini-2.5-flash',
    system: SYSTEM_PROMPT,
    prompt: `Idea: "${rawIdea}"${context}`,
    maxTokens: 2000,
  });

  return assumptions.slice(0, 5);
};
