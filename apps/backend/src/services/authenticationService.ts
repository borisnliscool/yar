import { NextFunction, Request, Response } from 'express';
import { database } from './databaseService';
import JwtService from './jwtService';

export default class AuthenticationService {
	static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
		const authorizationToken = req.headers.authorization?.replace('Bearer ', '');
		if (!authorizationToken) throw new Error('authorization header not found');

		let decodedToken!: Record<string, any>;
		try {
			decodedToken = JwtService.decodeToken(authorizationToken);
		} catch (error) {
			console.error(error);
			throw new Error('failed to decode authorization token');
		}

		if (decodedToken.type !== 'access' || !decodedToken.sub)
			throw new Error('invalid authorization token');

		const user = await database.user.findFirst({
			where: {
				id: decodedToken.sub,
			},
		});
		if (!user) throw new Error('failed to find user');

		req.user = user;

		return next();
	}
}
