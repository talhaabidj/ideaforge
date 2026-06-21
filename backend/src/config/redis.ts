import { Redis } from '@upstash/redis';
import { env } from './env.js';

// Redis is optional – when Upstash credentials are missing (e.g. on Vercel
// without the integration) we fall back to a no-op cache so the app still runs.
const hasRedis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN;

export const redis = hasRedis
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  const value = await redis.get<T>(key);
  return value ?? null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
  if (!redis) return;
  if (ttlSeconds) {
    await redis.set(key, value, { ex: ttlSeconds });
  } else {
    await redis.set(key, value);
  }
};
