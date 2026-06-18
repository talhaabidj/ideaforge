import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { db } from './config/db.js';
import { redis } from './config/redis.js';
import { createApp } from './app.js';

const startServer = async (): Promise<void> => {
  try {
    await redis.ping();
    logger.info('Redis connection verified');
  } catch (error) {
    logger.error({ error }, 'Redis connection failed');
  }

  logger.info('Database client initialized (Drizzle + Neon)');
  void db; // db is ready for use by services/controllers in later parts

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, 'IdeaForge backend listening');
  });
};

void startServer();
