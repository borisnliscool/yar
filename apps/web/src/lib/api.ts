import type { RequestError } from '@repo/types';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Options = {
	headers?: Headers;
	noAuth?: boolean;
	raw?: boolean;
};

export default class API {
	static fetch: typeof fetch = fetch;
	static authorizationToken?: string;

	static get(url: string, options?: Options) {
		return this.request(url, 'GET', undefined, options);
	}

	static post(url: string, body?: object | string, options?: Options) {
		return this.request(url, 'POST', body, options);
	}

	static put(url: string, body?: object | string, options?: Options) {
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

	private static async request(
		url: string,
		method: HTTPMethod,
		body?: object | string,
		options?: Options,
		attempt: number = 0
	): Promise<Response> {
		if (attempt > 2) throw new Error('[API] Failed to perform request, exceeded max attempts');

		const headers = options?.headers ?? new Headers();
		headers.set('withCredentials', 'true');

		if (!headers.has('Authorization') && !options?.noAuth) {
			this.authorizationToken ??= await this.getAuthorizationToken();
			headers.set('Authorization', `Bearer ${this.authorizationToken}`);
		}

		if ((method == 'POST' || method == 'PUT') && !headers.get('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		const response = await this.fetch(this.buildUrl(url), {
			method,
			body: (options?.raw ? body : JSON.stringify(body)) as BodyInit, // I don't like this any type
			headers,
			credentials: 'include'
		});

		if (response.status == 403) {
			this.authorizationToken = await this.getAuthorizationToken();
			return this.request(url, method, body, options, attempt + 1);
		}

		if (!response.ok) {
			const data: RequestError = await response.json();
			console.error(`[API] Failed to perform request: ${data.error.message}`, data);
			throw new Error(data.error.message);
		}

		return response;
	}

	static buildUrl(path: string) {
		return '/api' + (path.startsWith('/') ? '' : '/') + path;
	}
}
