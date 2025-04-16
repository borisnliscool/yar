import { NextFunction, Request, Response } from 'express';
import { merge } from 'lodash';
import * as RT from 'runtypes';

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateSchema = (record: RT.Record<any, any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			req.body = record.check(req.body);
			next();
			//eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			res.statusCode = 400;
			res.errorDetails = merge(res.errorDetails ?? {}, {
				schemaValidation: err.details,
			});
			throw new Error('Invalid request body.');
		}
	};
};
