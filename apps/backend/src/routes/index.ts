import { Router } from 'express';

import { router as authRouter } from './auth';
import { router as mediaRouter } from './media';
import { router as proxyRouter } from './proxy';
import { router as uploadRouter } from './upload';
import { router as videoRouter } from './videos';

export const router = Router();

router.use('/auth', authRouter);
router.use('/media', mediaRouter);
router.use('/proxy', proxyRouter);
router.use('/upload', uploadRouter);
router.use('/videos', videoRouter);
