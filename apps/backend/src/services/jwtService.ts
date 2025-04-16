import { JwtTokenType } from '@repo/types';
import jwt, { SignOptions } from 'jsonwebtoken';
import ms from 'ms';
import KeyService from './keyService';

export default class JwtService {
	private static privateKey = KeyService.getPrivateKey();
	private static publicKey = KeyService.getPublicKey();

	static encodeToken(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		payload: Record<string, any>,
		type: JwtTokenType,
		options: SignOptions = { expiresIn: ms('1d') }
	): string {
		return jwt.sign({ ...payload, type }, this.privateKey, {
			...options,
			algorithm: 'RS256',
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static decodeToken(token: string): Record<string, any> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return jwt.verify(token, this.publicKey) as Record<string, any>;
	}
}
