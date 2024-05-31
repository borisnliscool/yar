import { goto } from '$app/navigation';
import { ErrorType, type RequestError } from '@repo/types';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ParamsType = string | string[][] | Record<string, string> | URLSearchParams | undefined;

type Options = {
	headers?: Headers;
	noAuth?: boolean;
	raw?: boolean;
	params?: ParamsType;
	removeBaseUrl?: boolean;
};

export class HttpError extends Error {
	public readonly code: RequestError['error']['code'];
	public readonly details: RequestError['error']['details'];
	public readonly message: RequestError['error']['message'];
	public readonly trace: RequestError['error']['trace'];
	public readonly type: RequestError['error']['type'];

	constructor(err: RequestError) {
		super(err.error.message);
		this.code = err.error.code;
		this.details = err.error.details;
		this.message = err.error.message;
		this.trace = err.error.trace;
		this.type = err.error.type;
	}
}

export default class API {
	static fetch: typeof fetch = fetch;
	static authorizationToken?: string;
	static refreshTokenRequest: Promise<{ accessToken: string }> | null = null;

	static get(url: string, options?: Options) {
		return this.request(url, 'GET', undefined, options);
	}

	static post(url: string, body?: object | string | FormData, options?: Options) {
		return this.request(url, 'POST', body, options);
	}

	static put(url: string, body?: object | string | FormData, options?: Options) {
		return this.request(url, 'PUT', body, options);
	}

	static delete(url: string, options?: Options) {
		return this.request(url, 'DELETE', undefined, options);
	}

	static async getAuthorizationToken(): Promise<string> {
		try {
			if (!this.refreshTokenRequest) {
				this.refreshTokenRequest = this.request('/auth/refresh', 'POST', undefined, {
					noAuth: true
				}).then((response) => response.json());
			}

			const response = await this.refreshTokenRequest;
			this.refreshTokenRequest = null;
			return response.accessToken;
		} catch (error: unknown) {
			if (!(error instanceof HttpError)) {
				throw error;
			}

			if (error.type == ErrorType.INVALID_CREDENTIALS) {
				throw goto('/logout');
			}

			throw error;
		}
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

		if ((method == 'POST' || method == 'PUT') && !headers.get('Content-Type') && !options?.raw) {
			headers.set('Content-Type', 'application/json');
		}

		const response = await this.fetch(
			options?.removeBaseUrl ? url : this.buildUrl(url, options?.params ?? {}),
			{
				method,
				body: (options?.raw ? body : JSON.stringify(body)) as BodyInit, // I don't like this any type
				headers,
				credentials: 'include'
			}
		);

		if (!response.ok) {
			const data: RequestError = await response.json();

			if (data.error.type == ErrorType.ACCESS_TOKEN_EXPIRED) {
				this.authorizationToken = await this.getAuthorizationToken();
				return this.request(url, method, body, options, attempt + 1);
			}

			console.error(`[API] Failed to perform request: ${data.error.message}`, data);
			throw new HttpError(data);
		}

		return response;
	}

	static buildUrl(path: string, params: ParamsType = {}) {
		const paramString =
			params && Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
		return '/api' + (path.startsWith('/') ? '' : '/') + path + paramString;
	}
}
