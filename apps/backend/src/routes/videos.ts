import { Request, Response, Router } from 'express';
import VideoConverter from '../converters/videoConverter';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';

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

router.get('/:videoId', async (req: Request, res: Response) => {
	const video = await database.video.findUnique({
		where: {
			id: req.params.videoId,
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
