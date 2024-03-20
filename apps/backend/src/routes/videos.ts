import { Request, Response, Router } from 'express';
import RangeParser from 'range-parser';
import VideoConverter from '../converters/videoConverter';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import FileService from '../services/fileService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/', async (req: Request, res: Response) => {
	const { skip, count } = req.query;

	const databaseVideos = await database.video.findMany({
		take: Math.min(count ? +count : 20, 100),
		skip: skip ? +skip : 0,
		include: {
			author: true,
			thumbnail: true,
		},
	});

	const videos = databaseVideos.map((v) => VideoConverter.convert(v));

	return res.json({
		videos,
	});
});

router.get('/:mediaId', AuthenticationService.media, async (req: Request, res: Response) => {
	const video = await database.video.findUnique({
		where: {
			id: req.params.mediaId,
		},
		include: {
			author: true,
			thumbnail: true,
		},
	});

	if (!video) {
		res.statusCode = 404;
		throw new Error('video not found');
	}

	return res.json(VideoConverter.convert(video));
});

router.get('/:mediaId/stream', async (req: Request, res: Response) => {
	const video = await database.video.findUnique({
		where: {
			id: req.params.mediaId,
		},
		include: {
			author: true,
			thumbnail: true,
			media: true,
		},
	});

	if (!video) {
		res.statusCode = 404;
		throw new Error('video not found');
	}

	const fileName = `${video.media.id}.${video.media.extension}`;

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
		.set('Content-Type', 'video/mp4')
		.set('Content-Length', String(chunkSize))
		.set('Content-Range', `bytes ${start}-${end}/${stat.size}`);

	readStream.pipe(res);
});
