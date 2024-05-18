import { ErrorType, SessionDisplay } from '@repo/types';
import { Request, Response, Router } from 'express';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import JwtService from '../services/jwtService';
import TokenService from '../services/tokenService';

export const router = Router();

router.get('/', AuthenticationService.isAuthenticated, async (req: Request, res: Response) => {
	const refreshTokens = await database.user_refresh_token.findMany({
		where: {
			user_id: req.user!.id,
			expires_at: { gte: new Date() },
		},
		orderBy: {
			created_at: 'desc',
		},
	});

	const suppliedRefreshToken = req.cookies['refreshToken'];
	if (!suppliedRefreshToken) {
		return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'refresh cookie missing');
	}

	try {
		const decodedToken = JwtService.decodeToken(suppliedRefreshToken);
		const storedToken = await TokenService.getByRefreshToken(decodedToken.jti);

		return res.json(
			refreshTokens.map(
				(t) =>
					({
						id: t.id,
						device_name: t.device_name,
						created_at: t.created_at,
						current: storedToken?.id === t.id,
						device_type: t.device_type,
					}) as SessionDisplay
			)
		);
	} catch (error) {
		return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'invalid refresh token');
	}
});

router.delete(
	'/:sessionId',
	AuthenticationService.isAuthenticated,
	async (req: Request, res: Response) => {
		const sessionId = req.params.sessionId;
		const storedToken = await TokenService.getById(sessionId);

		if (!storedToken || storedToken.user_id !== req.user!.id) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 401, 'invalid session id');
		}

		await TokenService.deleteRefreshTokenById(storedToken.id);
		return res.sendStatus(200);
	}
);

router.delete('/', AuthenticationService.isAuthenticated, async (req: Request, res: Response) => {
	await TokenService.deleteAllByUserId(req.user!.id);
	return res.sendStatus(200);
});
