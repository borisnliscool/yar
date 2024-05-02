import { JwtTokenType } from '@repo/types';
import ms from 'ms';
import { database } from './databaseService';
import JwtService from './jwtService';
import StringGeneratorService from './stringGeneratorService';

export default class TokenService {
	static ACCESS_TOKEN_EXPIRY = ms(
		process.env.TOKEN_EXPIRY_ACCESS ? process.env.TOKEN_EXPIRY_ACCESS : '15m'
	);

	static REFRESH_TOKEN_EXPIRY = ms(
		process.env.TOKEN_EXPIRY_REFRESH ? process.env.TOKEN_EXPIRY_REFRESH : '7d'
	);

	static accessToken(userId: string) {
		return JwtService.encodeToken({}, JwtTokenType.ACCESS, {
			expiresIn: this.ACCESS_TOKEN_EXPIRY,
			subject: userId,
		});
	}

	static async refreshToken(userId: string, deviceName: string) {
		const data = {
			user_id: userId,
			device_name: deviceName,
			expires_at: new Date(
				new Date().getTime() +
					new Date(
						process.env.TOKEN_EXPIRY_REFRESH
							? ms(process.env.TOKEN_EXPIRY_REFRESH)
							: ms('7d')
					).getTime()
			),
			token: StringGeneratorService.generate(16),
		};

		await database.user_refresh_token.create({
			data,
		});

		return JwtService.encodeToken({}, JwtTokenType.REFRESH, {
			expiresIn: this.REFRESH_TOKEN_EXPIRY,
			subject: userId,
			jwtid: data.token,
		});
	}

	static getByRefreshToken(token: string) {
		return database.user_refresh_token.findFirst({
			where: {
				token,
			},
		});
	}

	static deleteRefreshTokenById(id: string) {
		return database.user_refresh_token.delete({
			where: {
				id,
			},
		});
	}
}
