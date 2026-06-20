import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

// Validates req[part] against the given schema. On success, the parsed
// (and defaulted/trimmed) data is stashed on res.locals[part] so controllers
// never have to re-validate or guess the shape of req.body/req.params again.
export const validateRequest = <T>(schema: ZodType<T>, part: RequestPart = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: `Request ${part} failed validation.`,
        issues: result.error.flatten().fieldErrors,
      });
      return;
    }

    res.locals[part] = result.data;
    next();
  };
