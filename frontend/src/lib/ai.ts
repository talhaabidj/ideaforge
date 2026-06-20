import ZAI from "z-ai-web-dev-sdk";

// Mirrors the teammate's `anthropicClient.callClaudeJson` — sends a single-turn
// message to the model and parses the reply as JSON. The teammate used
// Anthropic Claude; here we use z-ai-web-dev-sdk (sandbox backend). The system
// prompt is passed as an `assistant` message per the SDK convention, and we
// force-clean markdown fences so a stray ```json never breaks JSON.parse.

let zaiPromise: Promise<unknown> | null = null;

const getZai = async () => {
  if (!zaiPromise) {
    zaiPromise = ZAI.create();
  }
  return zaiPromise as Promise<Awaited<ReturnType<typeof ZAI.create>>>;
};

type CallJsonOptions = {
  system: string;
  prompt: string;
};

const stripMarkdownFences = (text: string): string =>
  text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

// Extracts the first JSON object/array from a model reply. The model usually
// obeys "JSON only", but a robust extractor keeps the pipeline resilient.
const extractJson = (text: string): string => {
  const cleaned = stripMarkdownFences(text);
  const start = cleaned.search(/[[{]/);
  if (start === -1) return cleaned;
  const opener = cleaned[start];
  const closer = opener === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === opener) depth++;
    else if (ch === closer) {
      depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }
  return cleaned.slice(start);
};

// Sends a single-turn message to the model and parses the reply as JSON.
// Throws loudly on malformed output (callers let it bubble to the route's
// error response) — never silently persists garbage.
export const callModelJson = async <T>(options: CallJsonOptions): Promise<T> => {
  const { system, prompt } = options;
  const zai = await getZai();

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "assistant", content: system },
      { role: "user", content: prompt },
    ],
    thinking: { type: "disabled" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw || !raw.trim()) {
    throw new Error("AI response contained no text content");
  }

  const jsonText = extractJson(raw);
  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error("AI returned malformed JSON");
  }
};
