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

// Sends a single-turn message to Gemini and parses the reply as JSON.
// Throws loudly on malformed output instead of silently persisting garbage —
// callers (services) let this bubble up to the global errorHandler.
export const callGeminiJson = async <T>(options: CallJsonOptions): Promise<T> => {
  const { model, system, prompt, maxTokens = 1024 } = options;

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
    console.log("GEMINI RAW:", text);
    console.log("GEMINI CLEANED:", cleaned);

    return JSON.parse(cleaned) as T;
  } catch (error) {
    logger.error({ error, model }, 'Failed to parse AI response as JSON or call failed');
    throw Error('AI returned malformed JSON or request failed');
  }
};
