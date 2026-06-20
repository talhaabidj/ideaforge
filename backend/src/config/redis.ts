import { Redis } from '@upstash/redis';
import { env } from './env.js';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const value = await redis.get<T>(key);
  return value ?? null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
  if (ttlSeconds) {
    await redis.set(key, value, { ex: ttlSeconds });
  } else {
    await redis.set(key, value);
  }
};
