import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Shared helpers that mirror the teammate's Express error handler shapes:
//  - ZodError → 400 { error: 'Validation failed', details: [...] }
//  - not found → 404 { error: 'NOT_FOUND', message }
//  - moderation → 403 { error: 'CONTENT_REJECTED', message, categories, timestamp }
//  - rate limit → 429 { error: 'RATE_LIMITED', message, retryAfter }
//  - generic → 500 { error: 'Internal server error' }

export const ok = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export const notFound = (message: string) =>
  NextResponse.json({ error: "NOT_FOUND", message }, { status: 404 });

export const rejected = (message: string, categories: string[]) =>
  NextResponse.json(
    {
      error: "CONTENT_REJECTED",
      message,
      categories,
      timestamp: new Date().toISOString(),
    },
    { status: 403 },
  );

export const rateLimited = (retryAfter: number) =>
  NextResponse.json(
    {
      error: "RATE_LIMITED",
      message: "Too many roadmap generations. Please slow down and try again shortly.",
      retryAfter,
    },
    { status: 429 },
  );

export const serverError = (detail?: string) =>
  NextResponse.json(
    { error: "Internal server error", detail: detail ?? undefined },
    { status: 500 },
  );

export const handleZod = (error: ZodError) =>
  NextResponse.json(
    {
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );

// Co-locate parsing + moderation so every AI-bound route reads identically.
export const readJson = async (request: Request): Promise<unknown> => {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Malformed JSON body");
  }
};
