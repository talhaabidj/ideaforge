import type { NextFunction, Request, Response } from 'express';
import { logger, getIsoTimestamp } from '../config/logger.js';
import { MODERATION_CATEGORIES } from '../utils/moderationPatterns.js';

// Caps protect this layer itself from being abused (huge payloads / deeply
// nested objects) before it has even decided whether the content is safe.
const MAX_SCAN_CHARS = 20_000;
const MAX_RECURSION_DEPTH = 4;

const extractText = (value: unknown, depth = 0): string => {
  if (depth > MAX_RECURSION_DEPTH) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((item) => extractText(item, depth + 1)).join(' ');
  }
  if (value !== null && typeof value === 'object') {
    return Object.values(value)
      .map((item) => extractText(item, depth + 1))
      .join(' ');
  }
  return '';
};

type ScreenResult = {
  flagged: boolean;
  categories: string[];
  severity: 'critical' | 'high' | 'none';
};

export const screenContent = (text: string): ScreenResult => {
  const matched = MODERATION_CATEGORIES.filter((category) =>
    category.patterns.some((pattern) => pattern.test(text)),
  );

  if (matched.length === 0) {
    return { flagged: false, categories: [], severity: 'none' };
  }

  const severity = matched.some((category) => category.severity === 'critical')
    ? 'critical'
    : 'high';

  return { flagged: true, categories: matched.map((category) => category.id), severity };
};

// Apply this on any route that forwards user input to an AI agent
// (intake, assumption, milestone, roadmap) — not on health/auth routes.
export const moderationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const text = extractText(req.body).slice(0, MAX_SCAN_CHARS);
  const result = screenContent(text);

  if (!result.flagged) {
    next();
    return;
  }

  const timestamp = getIsoTimestamp();

  // Only metadata is logged, never the raw flagged text — keeps logs safe
  // to store/share even when the rejected content itself is sensitive.
  logger.warn(
    {
      timestamp,
      ip: req.ip,
      method: req.method,
      path: req.originalUrl,
      categories: result.categories,
      severity: result.severity,
      contentLength: text.length,
    },
    'Moderation layer rejected request: harmful or illegal intent detected',
  );

  res.status(403).json({
    error: 'CONTENT_REJECTED',
    message:
      'Your submission was flagged by our content moderation system and cannot be processed. Please revise your idea and try again.',
    categories: result.categories,
    timestamp,
  });
};
