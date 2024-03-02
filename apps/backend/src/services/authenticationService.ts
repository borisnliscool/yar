import { NextFunction, Request, Response } from 'express';
import { database } from './databaseService';
import JwtService from './jwtService';

export default class AuthenticationService {
	static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
		const authorizationToken = req.headers.authorization?.replace('Bearer ', '');
		if (!authorizationToken) {
			res.statusCode = 403;
			throw new Error('authorization header not found');
		}

		let decodedToken!: Record<string, any>;
		try {
			decodedToken = JwtService.decodeToken(authorizationToken);
		} catch (error) {
			console.error(error);
			res.statusCode = 403;
			throw new Error('failed to decode authorization token');
		}

		if (decodedToken.type !== 'access' || !decodedToken.sub) {
			res.statusCode = 403;
			throw new Error('invalid authorization token');
		}

		const user = await database.user.findFirst({
			where: {
				id: decodedToken.sub,
			},
		});
		if (!user) throw new Error('failed to find user');

		req.user = user;

		return next();
	}

	static async media(req: Request, res: Response, next: NextFunction) {
		const { token: mediaToken } = req.query;
		if (!mediaToken) {
			res.statusCode = 403;
			throw new Error('media token not found');
		}

		let decodedToken!: Record<string, any>;
		try {
			decodedToken = JwtService.decodeToken(mediaToken as string);
		} catch (error) {
			console.error(error);
			res.statusCode = 403;
			throw new Error('failed to decode authorization token');
		}

		const { mediaId } = req.params;
		if (decodedToken.mediaId !== mediaId) {
			res.statusCode = 403;
			throw new Error('invalid media token');
		}

		return next();
	}
}
