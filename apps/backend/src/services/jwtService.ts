import jwt, { SignOptions } from 'jsonwebtoken';
import KeyService from './keyService';

export default class JwtService {
	private static privateKey = KeyService.getPrivateKey();
	private static publicKey = KeyService.getPublicKey();

	static encodeToken(
		payload: Record<string, any>,
		options: SignOptions = { expiresIn: '1d' }
	): string {
		return jwt.sign(payload, this.privateKey, {
			...options,
			algorithm: 'RS256',
		});
	}

	static decodeToken(token: string): Record<string, any> {
		return jwt.verify(token, this.publicKey) as Record<string, any>;
	}
}
