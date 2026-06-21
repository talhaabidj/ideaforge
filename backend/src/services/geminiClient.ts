import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);

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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Sends a single-turn message to Gemini and parses the reply as JSON.
// Retries up to 3 times on rate-limit (429) errors with exponential backoff.
export const callGeminiJson = async <T>(options: CallJsonOptions): Promise<T> => {
  const { model, system, prompt, maxTokens = 2048 } = options;
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const generativeModel = geminiClient.getGenerativeModel({
        model,
        systemInstruction: system,
      });

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        },
      });

      const text = result.response.text();

      if (!text) {
        throw Error('AI response contained no text content');
      }

      const cleaned = stripMarkdownFences(text);
      return JSON.parse(cleaned) as T;
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };

      // Retry on rate limit (429) with exponential backoff
      if (err.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        logger.warn({ model, attempt, delay }, `Rate limited, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      const errMsg = err.message || String(error);
      console.error(`Gemini error [${model}] attempt ${attempt}:`, errMsg);
      logger.error({ error: errMsg, model, attempt }, 'Failed to call Gemini or parse JSON');
      throw Error(`AI call failed: ${errMsg}`);
    }
  }

  throw Error('Max retries exceeded for Gemini call');
};
