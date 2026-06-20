import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';
import type { RequestHandler } from 'express';

const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'ratelimit:general',
});

const roadmapLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'ratelimit:roadmap',
});

const makeMiddleware = (limiter: Ratelimit): RequestHandler =>
  async (req, res, next) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);
    if (!success) {
      logger.warn({ ip, path: req.path }, 'Rate limit exceeded');
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }
    next();
  };

export const apiRateLimiter = makeMiddleware(generalLimiter);
export const roadmapGenerationLimiter = makeMiddleware(roadmapLimiter);