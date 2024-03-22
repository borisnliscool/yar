import { Request, Response, Router } from 'express';
import AuthenticationService from '../services/authenticationService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/me', async (req: Request, res: Response) => {
	return res.json(req.user!);
});
