import { Router } from 'express';
import { validateRequest } from '../utils/validateRequest.js';
import { moderationMiddleware } from '../middleware/moderation.js';
import { roadmapGenerationLimiter } from '../middleware/rateLimiter.js';
import { milestoneGenerateBodySchema } from '../schemas/milestone.schema.js';
import { roadmapIdParamSchema, milestoneIdParamSchema } from '../schemas/common.schema.js';
import {
  generateMilestones,
  listMilestones,
  acceptMilestone,
} from '../controllers/milestone.controller.js';

export const milestoneRouter = Router();

milestoneRouter.post(
  '/:roadmapId/generate',
  validateRequest(roadmapIdParamSchema, 'params'),
  validateRequest(milestoneGenerateBodySchema, 'body'),
  roadmapGenerationLimiter,
  moderationMiddleware,
  generateMilestones,
);

milestoneRouter.get(
  '/:roadmapId',
  validateRequest(roadmapIdParamSchema, 'params'),
  listMilestones,
);

milestoneRouter.patch(
  '/:milestoneId/accept',
  validateRequest(milestoneIdParamSchema, 'params'),
  acceptMilestone,
);