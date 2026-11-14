import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { User } from '@prisma/client';
import { db } from '../config/db.js';

// Each browser gets its own anonymous user. The frontend keeps the id it
// receives from GET /api/session and sends it back in this header.
export const USER_ID_HEADER = 'x-user-id';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const readUserId = (req: Request): string | null => {
  const value = req.header(USER_ID_HEADER);
  return value && UUID_PATTERN.test(value) ? value : null;
};

export const findOrCreateUser = async (userId: string | null): Promise<User> => {
  if (userId) {
    const existing = await db.user.findUnique({ where: { id: userId } });
    if (existing) return existing;
  }
  const id = randomUUID();
  return db.user.create({
    data: { id, email: `anonymous-${id}@ideaforge.invalid`, name: null },
  });
};

// Every route except /health and /session needs a known user.
export const requireUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = readUserId(req);
    const user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
    if (!user) {
      res.status(401).json({ error: 'NO_SESSION', message: 'Your session expired. Reload the page to start a new one.' });
      return;
    }
    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
