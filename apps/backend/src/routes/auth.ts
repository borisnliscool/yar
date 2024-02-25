import { compareSync } from 'bcrypt';
import { Request, Response, Router } from 'express';
import ms from 'ms';
import * as RT from 'runtypes';
import { rateLimit } from '../middleware/rateLimit';
import { validateSchema } from '../middleware/schemaValidation';
import { database } from '../services/databaseService';
import JwtService from '../services/jwtService';

export const router = Router();

const LoginSchema = RT.Record({
	username: RT.String,
	password: RT.String,
});

router.post(
	'/login',
	validateSchema(LoginSchema),
	rateLimit({
		window: 60 * 60,
		max: 5,
	}),
	async (req: Request, res: Response) => {
		const body = req.body as RT.Static<typeof LoginSchema>;
		const user = await database.user.findFirst({
			where: {
				username: body.username,
			},
		});

		if (!user || !compareSync(user.password_hash, body.password)) {
			res.statusCode = 401;
			throw new Error('invalid credentials');
		}

		// todo 2fa

		const refreshToken = JwtService.encodeToken(
			{ type: 'refresh' },
			{ expiresIn: ms('1w'), subject: user.id }
		);

		const accessToken = JwtService.encodeToken(
			{ type: 'access' },
			{ expiresIn: ms('1d'), subject: user.id }
		);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: ms('1w'),
		});

		return res.json({
			accessToken,
		});
	}
);

router.post('/refresh', async (req: Request, res: Response) => {
	const suppliedRefreshToken = req.cookies['refreshToken'];
	const decodedToken = JwtService.decodeToken(suppliedRefreshToken);

	if (!decodedToken) {
		res.statusCode = 401;
		throw new Error('invalid credentials');
	}

	const refreshToken = JwtService.encodeToken(
		{ type: 'refresh' },
		{ expiresIn: ms('1w'), subject: String(decodedToken.sub) }
	);

	const accessToken = JwtService.encodeToken(
		{ type: 'access' },
		{ expiresIn: ms('1d'), subject: String(decodedToken.sub) }
	);

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		maxAge: ms('1w'),
	});

	return res.json({
		accessToken,
	});
});
