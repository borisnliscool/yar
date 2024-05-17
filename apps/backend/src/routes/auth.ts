import { ErrorType, SettingsKey, UserRole } from '@repo/types';
import { compareSync, hashSync } from 'bcrypt';
import { Request, Response, Router } from 'express';
import * as OTPAuth from 'otpauth';
import * as RT from 'runtypes';
import { rateLimit } from '../middleware/rateLimit';
import { validateSchema } from '../middleware/schemaValidation';
import { database } from '../services/databaseService';
import JwtService from '../services/jwtService';
import SettingsService from '../services/settingsService';
import TokenService from '../services/tokenService';
import UserAgentParser from '../services/userAgentParser';

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

		if (!user || !compareSync(body.password, user.password_hash)) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'invalid credentials');
		}

		if (user.totp_secret) {
			if (!body.totp_code) {
				return req.fail(ErrorType.TOTP_REQUIRED, 401, 'totp code required');
			}

			const totp = new OTPAuth.TOTP({
				secret: user.totp_secret,
			});

			const isTokenValid = totp.validate({
				token: body.totp_code,
				window: 2,
			});

			if (!isTokenValid) {
				return req.fail(ErrorType.TOTP_INVALID, 401, 'totp code invalid');
			}
		}

		const refreshToken = await TokenService.refreshToken(
			user.id,
			UserAgentParser.getDeviceName(req.headers['user-agent']!)
		);
		const accessToken = TokenService.accessToken(user.id);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: TokenService.REFRESH_TOKEN_EXPIRY * 1000,
			path: '/',
		});

		return res.json({
			accessToken,
		});
	}
);

router.post('/refresh', async (req: Request, res: Response) => {
	const suppliedRefreshToken = req.cookies['refreshToken'];
	if (!suppliedRefreshToken) {
		return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'refresh cookie missing');
	}

	try {
		const decodedToken = JwtService.decodeToken(suppliedRefreshToken);
		const storedToken = await TokenService.getByRefreshToken(decodedToken.jti);

		if (
			!storedToken ||
			storedToken.expires_at < new Date() ||
			storedToken.user_id !== decodedToken.sub
		) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'invalid refresh token');
		}

		await TokenService.deleteRefreshTokenById(storedToken.id);

		const accessToken = TokenService.accessToken(storedToken.user_id);
		const newRefreshToken = await TokenService.refreshToken(
			storedToken.user_id,
			UserAgentParser.getDeviceName(req.headers['user-agent']!)
		);

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: TokenService.REFRESH_TOKEN_EXPIRY * 1000,
			path: '/',
		});

		return res.json({
			accessToken,
		});
	} catch (error) {
		return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'failed to verify refresh token');
	}
});

router.post('/logout', async (req: Request, res: Response) => {
	const suppliedRefreshToken = req.cookies['refreshToken'];
	if (suppliedRefreshToken) {
		const decodedToken = JwtService.decodeToken(suppliedRefreshToken);
		const storedToken = await TokenService.getByRefreshToken(decodedToken.jti);

		if (storedToken) {
			await TokenService.deleteRefreshTokenById(storedToken.id);
		}
	}

	res.clearCookie('refreshToken');
	return res.sendStatus(200);
});

const RegisterSchema = RT.Record({
	username: RT.String,
	password: RT.String,
});

router.post(
	'/register',
	validateSchema(RegisterSchema),
	rateLimit({
		window: 60 * 60,
		max: 5,
	}),
	async (req: Request, res: Response) => {
		if (!SettingsService.getSetting(SettingsKey.ENABLE_REGISTRATION)) {
			return req.fail(ErrorType.INSUFFICIENT_PERMISSIONS, 403, 'registration is disabled');
		}

		const body = req.body as RT.Static<typeof RegisterSchema>;

		if (await database.user.findFirst({ where: { username: body.username } })) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 409, 'username already taken');
		}

		const totalUsers = await database.user.count();
		const roles = totalUsers === 0 ? [UserRole.ADMIN, UserRole.USER] : [UserRole.USER];

		const user = await database.user.create({
			data: {
				username: body.username,
				password_hash: hashSync(body.password, 12),
				roles: roles.join(','),
			},
		});

		const refreshToken = await TokenService.refreshToken(
			user.id,
			UserAgentParser.getDeviceName(req.headers['user-agent']!)
		);
		const accessToken = TokenService.accessToken(user.id);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: TokenService.REFRESH_TOKEN_EXPIRY * 1000,
			path: '/',
		});

		return res.json({
			accessToken,
		});
	}
);
