import { Router } from 'express';
import { validateRequest } from '../utils/validateRequest.js';
import { firstStepGenerateBodySchema } from '../schemas/firstStep.schema.js';
import { roadmapIdParamSchema } from '../schemas/common.schema.js';
import { recommendFirstStep } from '../controllers/firstStep.controller.js';

export const firstStepRouter = Router();

// No moderationMiddleware here — the only input is an optional milestone
// UUID, there's no freeform idea text in this request to screen.
firstStepRouter.post(
  '/:roadmapId/recommend',
  validateRequest(roadmapIdParamSchema, 'params'),
  validateRequest(firstStepGenerateBodySchema, 'body'),
  recommendFirstStep,
);
