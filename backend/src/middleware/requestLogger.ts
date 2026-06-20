import pinoHttp from 'pino-http';
import type { RequestHandler } from 'express';
import { logger } from '../config/logger.js';

export const requestLogger: RequestHandler = pinoHttp({
  logger,
  customLogLevel: (_req, _res, err) => {
    if (err) return 'error';
    return 'info';
  },
  customSuccessMessage: (req, _res) => `${req.method} ${req.url} completed`,
  customErrorMessage: (req, _res, err) => `${req.method} ${req.url} failed - ${err.message}`,
}) as unknown as RequestHandler;