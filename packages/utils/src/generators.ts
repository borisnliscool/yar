export class Generators {
	static uid(length: number = 16) {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		return Array.from({ length }, () =>
			characters.charAt(Math.floor(Math.random() * characters.length))
		).reduce((acc, char) => acc + char, '');
	}
}
