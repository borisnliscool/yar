import { Router } from 'express';
import { router as authRouter } from './auth';

export const router = Router();

router.use('/auth', authRouter);
