import type { device_type } from '@prisma/client';
import { DeviceType, JwtTokenType, SettingsKey } from '@repo/types';
import ms from 'ms';
import { database } from './databaseService';
import JwtService from './jwtService';
import SettingsService from './settingsService';
import StringGeneratorService from './stringGeneratorService';
import UserAgentParser from './userAgentParser';

export default class TokenService {
	static ACCESS_TOKEN_EXPIRY = ms('15m');

	static async getRefreshTokenExpiration() {
		const settingValue = await SettingsService.getSetting(
			SettingsKey.REFRESH_TOKEN_EXPIRY_DURATION
		);

		return ms((settingValue as string | undefined) ?? '7d');
	}

	static accessToken(userId: string) {
		return JwtService.encodeToken({}, JwtTokenType.ACCESS, {
			expiresIn: this.ACCESS_TOKEN_EXPIRY,
			subject: userId,
		});
	}

	static async refreshToken(
		userId: string,
		useragent: string,
		deviceType: device_type = DeviceType.DESKTOP
	) {
		const deviceName = UserAgentParser.getDeviceName(useragent);

		const data = {
			user_id: userId,
			device_name: deviceName,
			device_type: deviceType,
			expires_at: new Date(
				new Date().getTime() + new Date(await this.getRefreshTokenExpiration()).getTime()
			),
			token: StringGeneratorService.generate(16),
		};

		await database.user_refresh_token.create({
			data,
		});

		return JwtService.encodeToken({}, JwtTokenType.REFRESH, {
			expiresIn: await this.getRefreshTokenExpiration(),
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

	static getById(id: string) {
		return database.user_refresh_token.findFirst({
			where: {
				id,
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

	static deleteAllByUserId(userId: string) {
		return database.user_refresh_token.deleteMany({
			where: {
				user_id: userId,
			},
		});
	}
}
