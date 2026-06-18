import { Router } from 'express';
import { validateRequest } from '../utils/validateRequest.js';
import { moderationMiddleware } from '../middleware/moderation.js';
import { roadmapGenerationLimiter } from '../middleware/rateLimiter.js';
import { assumptionGenerateBodySchema } from '../schemas/assumption.schema.js';
import { roadmapIdParamSchema } from '../schemas/common.schema.js';
import { generateAssumptions, listAssumptions } from '../controllers/assumption.controller.js';

export const assumptionRouter = Router();

assumptionRouter.post(
  '/:roadmapId/generate',
  validateRequest(roadmapIdParamSchema, 'params'),
  validateRequest(assumptionGenerateBodySchema, 'body'),
  roadmapGenerationLimiter,
  moderationMiddleware,
  generateAssumptions,
);

assumptionRouter.get(
  '/:roadmapId',
  validateRequest(roadmapIdParamSchema, 'params'),
  listAssumptions,
);