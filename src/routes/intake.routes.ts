import { Router } from 'express';
import { validateRequest } from '../utils/validateRequest.js';
import { moderationMiddleware } from '../middleware/moderation.js';
import { intakeSubmitSchema } from '../schemas/intake.schema.js';
import { roadmapIdParamSchema } from '../schemas/common.schema.js';
import { createIntake, getIntake } from '../controllers/intake.controller.js';

export const intakeRouter = Router();

intakeRouter.post(
  '/',
  validateRequest(intakeSubmitSchema, 'body'),
  moderationMiddleware,
  createIntake,
);

intakeRouter.get('/:roadmapId', validateRequest(roadmapIdParamSchema, 'params'), getIntake);
