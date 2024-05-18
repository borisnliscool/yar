import { ErrorType } from '@repo/types';
import { Request, Response, Router } from 'express';
import RangeParser from 'range-parser';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import FileService from '../services/fileService';

export const router = Router();

router.get('/:mediaId', AuthenticationService.media, async (req: Request, res: Response) => {
	const media = await database.media.findFirst({
		where: {
			id: req.params.mediaId,
		},
	});

	if (!media) {
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'media not found');
	}

	const fileName = `${media.id}.${media.extension}`;

	const stat = FileService.stat('media', fileName);
	const rangeHeader = req.headers.range || 'bytes=0-';
	const ranges = RangeParser(stat.size, rangeHeader, { combine: true });

	if (ranges === -1 || ranges === -2 || ranges.type !== 'bytes' || ranges.length !== 1) {
		res.statusCode = 416;
		res.setHeader('Content-Range', `bytes */${stat.size}`);
		return res.end();
	}

	const range = ranges[0];
	const start = range.start;
	const end = range.end;
	const chunkSize = end - start + 1;

	const readStream = FileService.createReadStream('media', fileName, { start, end });

	res.status(206)
		.set('Content-Type', media.mime_type)
		.set('Content-Length', String(chunkSize))
		.set('Content-Range', `bytes ${start}-${end}/${stat.size}`);

	return readStream.pipe(res);
});
