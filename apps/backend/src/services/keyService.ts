import crypto from 'crypto';
import FileService from './fileService';

export default class KeyService {
	private static publicKeyPath = 'public.pem';
	private static privateKeyPath = 'private.pem';

	private static cachedPublicKey: string | undefined;
	private static cachedPrivateKey: string | undefined;

	static getPublicKey(): string {
		if (this.cachedPublicKey) {
			return this.cachedPublicKey;
		}

		const publicKey = this.loadKeyFromFile(this.publicKeyPath);
		if (publicKey) {
			this.cachedPublicKey = publicKey;
			return publicKey;
		}

		const { publicKey: newPublicKey, privateKey: newPrivateKey } = this.generateKeys();
		this.saveKeys(newPublicKey, newPrivateKey);
		return newPublicKey;
	}

	static getPrivateKey(): string {
		if (this.cachedPrivateKey) {
			return this.cachedPrivateKey;
		}

		const privateKey = this.loadKeyFromFile(this.privateKeyPath);
		if (privateKey) {
			this.cachedPrivateKey = privateKey;
			return privateKey;
		}

		const { publicKey: newPublicKey, privateKey: newPrivateKey } = this.generateKeys();
		this.saveKeys(newPublicKey, newPrivateKey);
		return newPrivateKey;
	}

	private static loadKeyFromFile(keyPath: string): string | undefined {
		try {
			const key = FileService.readFile('keys', keyPath).toString();
			return key;
		} catch (error) {
			return undefined;
		}
	}

	private static generateKeys(): { publicKey: string; privateKey: string } {
		const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
			modulusLength: 2048,
			publicKeyEncoding: {
				type: 'pkcs1',
				format: 'pem',
			},
			privateKeyEncoding: {
				type: 'pkcs1',
				format: 'pem',
			},
		});

		return {
			publicKey: publicKey.toString(),
			privateKey: privateKey.toString(),
		};
	}

	private static saveKeys(publicKey: string, privateKey: string) {
		FileService.writeFile('keys', this.publicKeyPath, publicKey);
		FileService.writeFile('keys', this.privateKeyPath, privateKey);

		this.cachedPublicKey = publicKey;
		this.cachedPrivateKey = privateKey;
	}
}
