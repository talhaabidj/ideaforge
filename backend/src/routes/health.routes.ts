import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../config/db.js';
import { redis } from '../config/redis.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const checks = { server: 'ok', database: 'unknown', redis: 'unknown' };

  try {
    await db.execute(sql`select 1`);
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  const healthy = checks.database === 'ok' && checks.redis === 'ok';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});
