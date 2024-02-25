import { PUBLIC_API_URL } from '$env/static/public';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export default class API {
	static fetch: typeof fetch = fetch;
	static authenticationToken?: string;

	static get(url: string, headers?: Headers) {
		return this.request(url, 'GET', undefined, headers);
	}

	static post(url: string, body?: object, headers?: Headers) {
		return this.request(url, 'POST', body, headers);
	}

	static put(url: string, body?: object, headers?: Headers) {
		return this.request(url, 'PUT', body, headers);
	}

	static delete(url: string, headers?: Headers) {
		return this.request(url, 'DELETE', undefined, headers);
	}

	private static request(url: string, method: HTTPMethod, body?: object, headers?: Headers) {
		headers ??= new Headers();

		if (!headers.has('Authentication') && this.authenticationToken)
			headers.set('Authentication', `Bearer ${this.authenticationToken}`);

		return this.fetch(this.buildUrl(url), {
			method,
			body: JSON.stringify(body),
			headers
		});
	}

	private static buildUrl(path: string) {
		return PUBLIC_API_URL + (path.startsWith('/') ? '' : '/') + path;
	}
}
