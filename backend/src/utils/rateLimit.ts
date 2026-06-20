// In-memory sliding-window rate limiter — replaces the teammate's
// Upstash/Redis limiter for the sandbox. Same intent: protect the AI API
// budget by capping roadmap generations per identifier (IP) per window.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 20; // per window per identifier

const getIdentifier = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "local";
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

// Returns ok=false when the caller has exceeded the generation cap. Callers
// should respond with 429. Used for the expensive AI-generation endpoints
// (assumptions/milestones) — mirrors the teammate's `roadmapGenerationLimiter`.
export const checkRateLimit = (
  request: Request,
  windowMs = WINDOW_MS,
  max = MAX_REQUESTS,
): RateLimitResult => {
  const id = getIdentifier(request);
  const now = Date.now();
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(id, fresh);
    return { ok: true, remaining: max - 1, resetAt: fresh.resetAt };
  }

  if (bucket.count >= max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: max - bucket.count, resetAt: bucket.resetAt };
};
