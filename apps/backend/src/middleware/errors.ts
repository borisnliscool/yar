import { ErrorType, RequestError } from '@repo/types';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
	const code = res.statusCode == 200 ? 500 : res.statusCode;
	const errorType = res.errorType ?? ErrorType.UNKNOWN;

	const data: RequestError = {
		error: {
			type: errorType,
			code: code,
			message: err.message,
			details: res.errorDetails ?? {},
		},
	};

	if (process.env.NODE_ENV !== 'production') data.error.trace = err.stack;
	res.status(code).json(data);

	console.error(err);
};
