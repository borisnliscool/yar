import type { user } from '@prisma/client';
import { ErrorType, UserRole } from '@repo/types';
import { compareSync, hashSync } from 'bcrypt';
import { Request, Response, Router } from 'express';
import * as RT from 'runtypes';
import userConverter from '../converters/userConverter';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import MediaService from '../services/mediaService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/me', async (req: Request, res: Response) => {
	res.json({
		...userConverter.convert(req.user!),
		totp_enabled: !!req.user!.totp_secret,
	});
});

const ProfileUpdateSchema = RT.Record({
	username: RT.String,
	oldPassword: RT.String.optional(),
	newPassword: RT.String.optional(),
});

router.put('/me', validateSchema(ProfileUpdateSchema), async (req: Request, res: Response) => {
	const body: RT.Static<typeof ProfileUpdateSchema> = req.body;

	if (!req.user) {
		req.fail(ErrorType.UNAUTHORIZED, 401, 'unauthorized');
		return;
	}

	if (!!body.oldPassword !== !!body.newPassword) {
		req.fail(
			ErrorType.INVALID_CREDENTIALS,
			401,
			'oldPassword and newPassword must be provided together'
		);
	}

	const updateUser: Partial<user> = {};
	updateUser.username = body.username;

	if (body.oldPassword && body.newPassword) {
		if (!compareSync(body.oldPassword, req.user.password_hash)) {
			req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'invalid credentials');
			return;
		}

		updateUser.password_hash = hashSync(body.newPassword, 12);
	}

	const user = await database.user.update({
		where: {
			id: req.user!.id,
		},
		data: updateUser,
	});

	res.json(userConverter.convert(user));
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
		res.json(users.map(userConverter.convert));
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
			include: {
				uploads: {
					include: {
						thumbnail: true,
						media: true,
					},
				},
			},
		});

		if (!user) {
			req.fail(ErrorType.UNKNOWN, 404, 'user not found');
			return;
		}

		if (user.id === req.user!.id) {
			req.fail(ErrorType.INVALID_CREDENTIALS, 403, 'cannot delete yourself');
			return;
		}

		for (const upload of user.uploads) {
			await database.media.delete({
				where: {
					id: upload.media.id,
				},
			});
			MediaService.deleteMediaFile(upload.media);

			if (upload.thumbnail) {
				await database.media.delete({
					where: {
						id: upload.thumbnail.id,
					},
				});
				MediaService.deleteMediaFile(upload.thumbnail);
			}
		}

		await database.user_refresh_token.deleteMany({
			where: {
				user_id: user.id,
			},
		});

		await database.video.deleteMany({
			where: {
				author_id: user.id,
			},
		});

		await database.user.delete({
			where: {
				id: user.id,
			},
			include: {
				uploads: {
					include: {
						thumbnail: true,
						media: true,
					},
				},
			},
		});

		res.json({});
	}
);
