import { ErrorType } from '@repo/types';
import { NextFunction, Request, Response } from 'express';

export const methodsMiddleware = () => (req: Request, res: Response, next: NextFunction) => {
	req.fail = (errorType: ErrorType, status: number, message: string) => {
		res.errorType = errorType;
		res.statusCode = status;
		throw new Error(message);
	};

	next();
};
