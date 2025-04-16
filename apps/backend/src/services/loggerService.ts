import { Writable, WritableOptions } from 'stream';

class LoggerStream extends Writable {
	#resource: string;

	constructor(resource: string, options?: WritableOptions) {
		super(options);
		this.#resource = resource;
	}

	_write(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		chunk: any,
		_encoding: BufferEncoding,
		callback: (error?: Error | null | undefined) => void
	): void {
		const message = chunk.toString().trim();
		if (message.length > 0) LoggerService.log(this.#resource, message);
		callback();
	}
}

export default class LoggerService {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static log(resource: string, ...args: any[]) {
		const name = resource.slice(0, 10).padEnd(10, ' ');
		console.log(`[${name}]`, ...args);
	}

	static createLogger(resource: string) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (...args: any[]) => this.log(resource, ...args);
	}

	static createLoggerStream(resource: string) {
		return new LoggerStream(resource);
	}
}
