import { Router } from 'express';
import { router as authRouter } from './auth';
import { router as videoRouter } from './videos';

export const router = Router();

router.use('/auth', authRouter);
router.use('/videos', videoRouter);
