import { Request, Response, Router } from 'express';
import * as RT from 'runtypes';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/me', async (req: Request, res: Response) => {
	return res.json(req.user!);
});

const ProfileUpdateSchema = RT.Record({
	username: RT.String,
});

router.put('/me', validateSchema(ProfileUpdateSchema), async (req: Request, res: Response) => {
	const user = await database.user.update({
		where: {
			id: req.user!.id,
		},
		data: {
			username: req.body.username,
		},
	});

	return res.json(user);
});
