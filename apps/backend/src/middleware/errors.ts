import { RequestError } from '@repo/types';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
	const code = res.statusCode == 200 ? 500 : res.statusCode;

	const data: RequestError = {
		error: {
			code: code,
			message: err.message,
			details: res.errorDetails,
		},
	};

	if (process.env.NODE_ENV !== 'production') data.error.stack = err.stack;
	res.status(code).json(data);

	console.error(err);
};
