import bodyParser from 'body-parser';

export default class BodyParsers {
	static json = bodyParser.json({
		limit: '1mb',
		type: '*/json',
	});
	static raw = bodyParser.raw({
		limit: '10mb',
		type: 'application/octet-stream',
	});
}
