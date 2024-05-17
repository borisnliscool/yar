import { user } from '@repo/database';
import { ErrorType, UserRole } from '@repo/types';
import { compareSync, hashSync } from 'bcrypt';
import { Request, Response, Router } from 'express';
import * as RT from 'runtypes';
import userConverter from '../converters/userConverter';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/me', async (req: Request, res: Response) => {
	return res.json(userConverter.convert(req.user!));
});

const ProfileUpdateSchema = RT.Record({
	username: RT.String,
	oldPassword: RT.String.optional(),
	newPassword: RT.String.optional(),
});

router.put('/me', validateSchema(ProfileUpdateSchema), async (req: Request, res: Response) => {
	const body: RT.Static<typeof ProfileUpdateSchema> = req.body;

	if (!req.user) {
		return req.fail(ErrorType.UNAUTHORIZED, 401, 'unauthorized');
	}

	if (!!body.oldPassword !== !!body.newPassword) {
		return req.fail(
			ErrorType.INVALID_CREDENTIALS,
			401,
			'oldPassword and newPassword must be provided together'
		);
	}

	const updateUser: Partial<user> = {};
	updateUser.username = body.username;

	if (body.oldPassword && body.newPassword) {
		if (!compareSync(body.oldPassword, req.user.password_hash)) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'invalid credentials');
		}

		updateUser.password_hash = hashSync(body.newPassword, 12);
	}

	const user = await database.user.update({
		where: {
			id: req.user!.id,
		},
		data: updateUser,
	});

	return res.json(userConverter.convert(user));
});

router.get(
	'/',
	AuthenticationService.hasRoles(UserRole.ADMIN),
	async (_: Request, res: Response) => {
		const users = await database.user.findMany({
			orderBy: {
				created_at: 'desc',
			},
		});
		return res.json(users.map(userConverter.convert));
	}
);

router.delete(
	'/:userId',
	AuthenticationService.hasRoles(UserRole.ADMIN),
	async (req: Request, res: Response) => {
		const user = await database.user.findUnique({
			where: {
				id: req.params.userId,
			},
		});

		if (!user) {
			return req.fail(ErrorType.UNKNOWN, 404, 'user not found');
		}

		if (user.id === req.user!.id) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 403, 'cannot delete yourself');
		}

		await database.user.delete({
			where: {
				id: user.id,
			},
		});

		return res.json({});
	}
);
