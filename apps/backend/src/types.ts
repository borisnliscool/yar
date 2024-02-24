declare global {
	namespace Express {
		interface Request {}

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
