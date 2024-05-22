import { ErrorType, UserRole } from '@repo/types';
import { NextFunction, Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { database } from './databaseService';
import JwtService from './jwtService';

export default class AuthenticationService {
	static async checkAuthentication(req: Request, res: Response, next: NextFunction) {
		const authorizationToken = req.headers.authorization?.replace('Bearer ', '');
		if (!authorizationToken) {
			return next();
		}

		let decodedToken!: Record<string, any>;
		try {
			decodedToken = JwtService.decodeToken(authorizationToken);
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				return req.fail(ErrorType.ACCESS_TOKEN_EXPIRED, 403, 'authorization token expired');
			}

			return req.fail(
				ErrorType.INVALID_CREDENTIALS,
				403,
				'failed to decode authorization token'
			);
		}

		if (decodedToken.type !== 'access' || !decodedToken.sub) {
			return next();
		}

		const user = await database.user.findFirst({
			where: {
				id: decodedToken.sub,
			},
		});

		req.user = user ? user : undefined;
		return next();
	}

	static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
		const authorizationToken = req.headers.authorization?.replace('Bearer ', '');
		if (!authorizationToken) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 403, 'authorization header not found');
		}

		if (!req.user) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 403, 'failed to find user');
		}

		return next();
	}

	static async media(req: Request, res: Response, next: NextFunction) {
		const { token: mediaToken } = req.query;
		if (!mediaToken) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 403, 'media token not found');
		}

		let decodedToken!: Record<string, any>;
		try {
			decodedToken = JwtService.decodeToken(mediaToken as string);
		} catch (error) {
			console.error(error);
			return req.fail(
				ErrorType.INVALID_CREDENTIALS,
				403,
				'failed to decode authorization token'
			);
		}

		const { mediaId } = req.params;
		if (decodedToken.mediaId !== mediaId) {
			return req.fail(ErrorType.INVALID_CREDENTIALS, 403, 'invalid media token');
		}

		return next();
	}

	static hasRoles(_roles: UserRole | UserRole[]) {
		return async (req: Request, res: Response, next: NextFunction) => {
			const roles = typeof _roles == 'string' ? [_roles] : _roles;

			if (
				!req.user ||
				!req.user.roles.split(',').some((role) => roles.includes(role as UserRole))
			) {
				return req.fail(
					ErrorType.INSUFFICIENT_PERMISSIONS,
					403,
					'insufficient permissions'
				);
			}

			return next();
		};
	}
}
