import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export type AppError = Error & { statusCode: number; isOperational: true };

// Functional error factory - calling Error(message) WITHOUT `new` still returns
// a valid Error instance per the JS spec, so this stays class/new free.
export const createAppError = (message: string, statusCode = 500): AppError => {
  const error = Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

const isAppError = (err: unknown): err is AppError =>
  typeof err === 'object' && err !== null && 'isOperational' in err && 'statusCode' in err;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    logger.warn({ path: req.path, issues: err.issues }, 'Validation error');
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
    return;
  }

  if (isAppError(err)) {
    logger.warn({ path: req.path, statusCode: err.statusCode }, err.message);
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error({ path: req.path, err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};
