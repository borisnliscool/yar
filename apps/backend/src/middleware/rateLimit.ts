import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { merge } from 'lodash';

interface RateLimitOptions {
	window?: number;
	max?: number;
	identify?: (req: Request, res: Response, next: NextFunction) => string | Promise<string>;
}

const defaults: RateLimitOptions = {
	window: 5 * 1000,
	max: 10,
	identify: (req: Request): string => {
		return req.clientIp ?? randomUUID();
	},
};

export const rateLimit = (options?: RateLimitOptions) => {
	const _options = merge({ ...defaults }, options ?? {});
	const requestQueue = new Map<string, Array<{ time: Date }>>();

	return async (req: Request, res: Response, next: NextFunction) => {
		const identifier = await _options.identify!(req, res, next);
		const now = Date.now();
		let entry = requestQueue.get(identifier) || [];

		// Remove entries older than the window
		entry = entry.filter((item) => now - item.time.getTime() <= _options.window!);

		if (entry.length < _options.max!) {
			entry.push({ time: new Date(now) });
			requestQueue.set(identifier, entry);
			return next();
		}

		const timeUntilReset = now - entry[0].time.getTime() + _options.window!;
		res.setHeader('Retry-After', Math.ceil(timeUntilReset / 1000));
		res.statusCode = 429;

		throw new Error('Too many requests, please try again later.');
	};
};
