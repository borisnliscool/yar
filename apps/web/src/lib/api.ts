import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestError } from '@repo/types';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Options = {
	headers?: Headers;
	noAuth?: boolean;
};

export default class API {
	static fetch: typeof fetch = fetch;
	static authorizationToken?: string;

	static get(url: string, options?: Options) {
		return this.request(url, 'GET', undefined, options);
	}

	static post(url: string, body?: object, options?: Options) {
		return this.request(url, 'POST', body, options);
	}

	static put(url: string, body?: object, options?: Options) {
		return this.request(url, 'PUT', body, options);
	}

	static delete(url: string, options?: Options) {
		return this.request(url, 'DELETE', undefined, options);
	}

	static async getAuthorizationToken(): Promise<string> {
		const response = await this.request('/auth/refresh', 'POST', undefined, {
			noAuth: true
		});
		const data = (await response.json()) as { accessToken: string };
		return data.accessToken;
	}

	private static async request(url: string, method: HTTPMethod, body?: object, options?: Options) {
		const headers = options?.headers ?? new Headers();

		if (!headers.has('Authorization') && !options?.noAuth) {
			this.authorizationToken ??= await this.getAuthorizationToken();
			headers.set('Authorization', `Bearer ${this.authorizationToken}`);
		}

		if ((method == 'POST' || method == 'PUT') && !headers.get('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		const response = await this.fetch(this.buildUrl(url), {
			method,
			body: JSON.stringify(body),
			headers,
			credentials: 'include'
		});

		// todo check if the token expired, if so request a new one and try again

		if (!response.ok) {
			const data: RequestError = await response.json();
			console.error(`[API] Failed to perform request: ${data.error.message}`, data);
			throw new Error(data.error.message);
		}

		return response;
	}

	private static buildUrl(path: string) {
		return PUBLIC_API_URL + (path.startsWith('/') ? '' : '/') + path;
	}
}
