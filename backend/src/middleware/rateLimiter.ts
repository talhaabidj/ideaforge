import { Ratelimit } from '@upstash/ratelimit';
import type { RequestHandler } from 'express';
import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';

type LimitResult = { success: boolean; limit: number; remaining: number; reset: number };
type LimitCheck = (key: string) => Promise<LimitResult>;

// Used when Upstash is not configured. Counts are kept per server instance,
// so on serverless hosting this is a soft cap rather than a hard one.
export const createMemoryLimiter = (max: number, windowMs: number): LimitCheck => {
  const windows = new Map<string, { count: number; reset: number }>();
  return async (key) => {
    const now = Date.now();
    const current = windows.get(key);
    if (!current || current.reset <= now) {
      windows.set(key, { count: 1, reset: now + windowMs });
      return { success: true, limit: max, remaining: max - 1, reset: now + windowMs };
    }
    current.count += 1;
    const remaining = Math.max(0, max - current.count);
    return { success: current.count <= max, limit: max, remaining, reset: current.reset };
  };
};

const createUpstashLimiter = (max: number, window: '1 m' | '1 h', prefix: string): LimitCheck => {
  const limiter = new Ratelimit({ redis: redis!, limiter: Ratelimit.slidingWindow(max, window), prefix });
  return (key) => limiter.limit(key);
};

const makeMiddleware = (check: LimitCheck): RequestHandler => async (req, res, next) => {
  try {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const { success, limit, remaining, reset } = await check(ip);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);
    if (!success) {
      logger.warn({ ip, path: req.path }, 'Rate limit exceeded');
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

const ONE_MINUTE = 60_000;
const ONE_HOUR = 60 * ONE_MINUTE;

// General cap on all API calls, and a tighter cap on the calls that run Gemini.
export const apiRateLimiter = makeMiddleware(
  redis ? createUpstashLimiter(60, '1 m', 'ratelimit:general') : createMemoryLimiter(60, ONE_MINUTE),
);
export const aiRateLimiter = makeMiddleware(
  redis ? createUpstashLimiter(30, '1 h', 'ratelimit:ai') : createMemoryLimiter(30, ONE_HOUR),
);
