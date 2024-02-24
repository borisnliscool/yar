import { Request, Response, Router } from 'express';

export const router = Router();

router.get('/', async (req: Request, res: Response) => {
	return res.json({
		ok: true,
	});
});
