import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { intakeRouter } from './intake.routes.js';
import { assumptionRouter } from './assumption.routes.js';
import { milestoneRouter } from './milestone.routes.js';
import { firstStepRouter } from './firstStep.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/intake', intakeRouter);
apiRouter.use('/assumptions', assumptionRouter);
apiRouter.use('/milestones', milestoneRouter);
apiRouter.use('/first-step', firstStepRouter);
