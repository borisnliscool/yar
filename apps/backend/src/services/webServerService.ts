import express from 'express';
import 'express-async-errors';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import requestIp from 'request-ip';

import { errorHandler } from '../middleware/errors';
import { notFoundHandler } from '../middleware/notFound';
import { router } from '../routes';
import LoggerService from './loggerService';

export default class WebServerService {
	private static app = express();
	private static logger = LoggerService.createLogger('webserver');

	private static applyMiddlewares() {
		this.app.use(express.json());
		this.app.use(helmet());
		this.app.use(cors());
		this.app.use(
			morgan('dev', {
				stream: LoggerService.createLoggerStream('webserver'),
			})
		);
		this.app.use(requestIp.mw());
		this.app.use(compression());
		this.app.use(cookieParser());

		this.logger('Applied middlewares');
	}

	private static applyExceptionHandlers() {
		this.app.use(notFoundHandler);
		this.app.use(errorHandler);

		this.logger('Applied exception handlers');
	}

	public static start() {
		this.applyMiddlewares();
		this.app.use(router);
		this.applyExceptionHandlers();

		this.app.listen(3000, () => this.logger('Listening on port 3000'));
	}
}
