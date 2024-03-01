import { user } from '@repo/database';

declare global {
	namespace Express {
		interface Request {
			user?: user;
		}

		interface Response {
			errorDetails?: object;
		}
	}

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV?: string;
		}
	}
}
