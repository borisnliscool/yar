import { compareSync } from 'bcrypt';
import { Request, Response, Router } from 'express';
import ms from 'ms';
import * as OTPAuth from 'otpauth';
import * as RT from 'runtypes';
import { rateLimit } from '../middleware/rateLimit';
import { validateSchema } from '../middleware/schemaValidation';
import { database } from '../services/databaseService';
import JwtService from '../services/jwtService';

export const router = Router();

const LoginSchema = RT.Record({
	username: RT.String,
	password: RT.String,
	totp_code: RT.String.optional(),
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

		const invalid = (message?: string) => {
			res.statusCode = 401;
			throw new Error(message ? message : 'invalid credentials');
		};

		if (!user || !compareSync(body.password, user.password_hash)) {
			return invalid();
		}

		if (user.totp_secret) {
			if (!body.totp_code) return invalid('totp code missing');

			const totp = new OTPAuth.TOTP({
				secret: user.totp_secret,
			});

			const isTokenValid = totp.validate({
				token: body.totp_code,
				window: 2,
			});

			if (!isTokenValid) {
				return invalid('totp code invalid');
			}
		}

		const refreshToken = JwtService.encodeToken(
			{ type: 'refresh' },
			{ expiresIn: ms('1w'), subject: user.id }
		);

		// todo 1 day access token might be a bit long?
		const accessToken = JwtService.encodeToken(
			{ type: 'access' },
			{ expiresIn: ms('1d'), subject: user.id }
		);

		return res.json({
			accessToken,
			refreshToken,
		});
	}
);

router.post('/refresh', async (req: Request, res: Response) => {
	const suppliedRefreshToken = req.cookies['refreshToken'];
	if (!suppliedRefreshToken) throw new Error('refresh cookie missing');

	try {
		const decodedToken = JwtService.decodeToken(suppliedRefreshToken);

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
	} catch (error) {
		console.error(error);
		res.statusCode = 401;
		throw new Error('failed to verify refresh token');
	}
});
