import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestError } from '@repo/types';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export default class API {
	static fetch: typeof fetch = fetch;
	static authenticationToken?: string;

	static get(url: string, headers?: Headers) {
		return this.request(url, 'GET', undefined, headers);
	}

	static post(url: string, body: object, headers?: Headers) {
		return this.request(url, 'POST', body, headers);
	}

	static put(url: string, body: object, headers?: Headers) {
		return this.request(url, 'PUT', body, headers);
	}

	static delete(url: string, headers?: Headers) {
		return this.request(url, 'DELETE', undefined, headers);
	}

	private static async request(url: string, method: HTTPMethod, body?: object, headers?: Headers) {
		headers ??= new Headers();

		if (!headers.has('Authentication') && this.authenticationToken)
			headers.set('Authentication', `Bearer ${this.authenticationToken}`);

		if ((method == 'POST' || method == 'PUT') && !headers.get('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		const response = await this.fetch(this.buildUrl(url), {
			method,
			body: JSON.stringify(body),
			headers
		});

		if (!response.ok) {
			const data: RequestError = await response.json();
			console.error('[API] Failed to perform request: ', data);
			throw new Error(data.error.message);
		}

		return response;
	}

	private static buildUrl(path: string) {
		return PUBLIC_API_URL + (path.startsWith('/') ? '' : '/') + path;
	}
}
