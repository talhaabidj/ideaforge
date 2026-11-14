import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import type { RequestHandler } from 'express';
import { allowedOrigins } from '../config/env.js';
import { logger } from '../config/logger.js';
import { USER_ID_HEADER } from './session.js';

// Helmet: sets security headers (XSS protection, clickjacking prevention, etc.)
export const helmetMiddleware: RequestHandler = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
});

// CORS: exact allowed origins from ALLOWED_ORIGINS, or any origin when it is "*" (the default)
const corsOriginCheck: CorsOptions['origin'] = (origin, callback) => {
  // Allow requests with no origin (server-to-server, curl, health checks)
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  logger.warn({ origin }, 'Blocked request from disallowed origin');
  callback(new Error('Not allowed by CORS policy'));
};

export const corsMiddleware: RequestHandler = cors({
  origin: corsOriginCheck,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', USER_ID_HEADER],
  maxAge: 86400,
});
