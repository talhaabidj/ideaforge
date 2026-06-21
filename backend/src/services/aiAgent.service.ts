import { callGeminiJson } from './geminiClient.js';
import type { SixWThreeH } from '../schemas/index.js';

const SIX_W_3H_FIELDS = [
  'who',
  'what',
  'where',
  'when',
  'why',
  'which',
  'how',
  'howMuch',
  'howMany',
] as const;

const SYSTEM_PROMPT = `You are an intake analyst for a startup idea planning tool.
Given a raw idea description, infer the missing fields of the 6W3H framework
(who, what, where, when, why, which, how, howMuch, howMany). Make reasonable
inferences from context. If a field is genuinely unknowable from the text,
respond with "Not specified - needs founder input" for that field.
Respond ONLY with a JSON object containing exactly the requested keys as
strings. No preamble, no markdown fences, no extra keys.`;

// Only calls the AI for fields the user actually left blank. Anything the
// user already typed is trusted as-is and never overwritten by a guess —
// this keeps the human in the loop for whatever they bothered to specify.
export const inferSixWThreeH = async (
  rawIdea: string,
  partial: SixWThreeH = {},
): Promise<SixWThreeH> => {
  const missingFields = SIX_W_3H_FIELDS.filter((field) => !partial[field]);

  if (missingFields.length === 0) {
    return partial;
  }

  const inferred = await callGeminiJson<SixWThreeH>({
    model: 'gemini-2.5-flash',
    system: SYSTEM_PROMPT,
    prompt: `Raw idea: "${rawIdea}"\n\nFields needed: ${missingFields.join(', ')}`,
    maxTokens: 2000,
  });

  // Spread order matters: AI fills gaps first, then user-provided values
  // overwrite them, guaranteeing user input always wins.
  return { ...inferred, ...partial };
};
