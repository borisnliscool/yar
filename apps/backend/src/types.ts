import type { user } from '@prisma/client';
import { ErrorType } from '@repo/types';

declare global {
	namespace Express {
		interface Request {
			user?: user;

			/**
			 * Shortcut function to send an error response.
			 * @param errorType The type of the error.
			 * @param status The status code of the response.
			 * @param message The message to send with the response.
			 */
			fail: (errorType: ErrorType, status: number, message: string) => void;
		}

		interface Response {
			errorDetails?: object;
			errorType?: ErrorType;
		}
	}

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV?: string;
			DOMAIN: string;
		}
	}
}
