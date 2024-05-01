import { user } from '@repo/database';
import { compareSync, hashSync } from 'bcrypt';
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
	oldPassword: RT.String.optional(),
	newPassword: RT.String.optional(),
});

router.put('/me', validateSchema(ProfileUpdateSchema), async (req: Request, res: Response) => {
	const body: RT.Static<typeof ProfileUpdateSchema> = req.body;

	if (!req.user) {
		res.statusCode = 401;
		throw new Error('unauthorized');
	}

	if (!!body.oldPassword !== !!body.newPassword) {
		res.statusCode = 400;
		throw new Error('oldPassword and newPassword must be provided together');
	}

	const updateUser: Partial<user> = {};
	updateUser.username = body.username;

	if (body.oldPassword && body.newPassword) {
		if (!compareSync(body.oldPassword, req.user.password_hash)) {
			res.statusCode = 401;
			throw new Error('invalid password');
		}

		updateUser.password_hash = hashSync(body.newPassword, 12);
	}

	const user = await database.user.update({
		where: {
			id: req.user!.id,
		},
		data: updateUser,
	});

	return res.json(user);
});
