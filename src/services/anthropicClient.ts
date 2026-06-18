import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Third-party SDK requires `new` for client construction — unavoidable even
// in a class/new/this-free codebase. This is the only place it happens; every
// service below only ever calls the plain function `callClaudeJson`.
export const anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

type CallJsonOptions = {
  model: string;
  system: string;
  prompt: string;
  maxTokens?: number;
};

const stripMarkdownFences = (text: string): string =>
  text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');

// Sends a single-turn message to Claude and parses the reply as JSON.
// Throws loudly on malformed output instead of silently persisting garbage —
// callers (services) let this bubble up to the global errorHandler.
export const callClaudeJson = async <T>(options: CallJsonOptions): Promise<T> => {
  const { model, system, prompt, maxTokens = 1024 } = options;

  const response = await anthropicClient.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');

  if (!textBlock || textBlock.type !== 'text') {
    throw Error('AI response contained no text content');
  }

  const cleaned = stripMarkdownFences(textBlock.text);

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    logger.error({ error, raw: textBlock.text, model }, 'Failed to parse AI response as JSON');
    throw Error('AI returned malformed JSON');
  }
};
