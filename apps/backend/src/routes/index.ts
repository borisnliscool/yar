import { Request, Response, Router } from 'express';

import { router as authRouter } from './auth';
import { router as mediaRouter } from './media';
import { router as proxyRouter } from './proxy';
import { router as sessionsRouter } from './sessions';
import { router as settingsRouter } from './settings';
import { router as statsRouter } from './stats';
import { router as uploadRouter } from './upload';
import { router as userRouter } from './users';
import { router as videoRouter } from './videos';

export const router = Router();

router.use('/auth', authRouter);
router.use('/media', mediaRouter);
router.use('/proxy', proxyRouter);
router.use('/upload', uploadRouter);
router.use('/videos', videoRouter);
router.use('/users', userRouter);
router.use('/settings', settingsRouter);
router.use('/sessions', sessionsRouter);
router.use('/stats', statsRouter);

router.get('/', async (_: Request, res: Response) => {
	res.json({
		status: 'ok',
		uptime: process.uptime(),
	});
});
