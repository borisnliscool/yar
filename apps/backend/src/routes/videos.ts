import { Request, Response, Router } from 'express';
import { shuffle } from 'lodash';
import * as RT from 'runtypes';
import VideoConverter from '../converters/videoConverter';
import { validateSchema } from '../middleware/schemaValidation';
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
			media: true,
		},
	});

	const videos = databaseVideos.map(VideoConverter.convert);

	return res.json({
		videos: shuffle(videos),
	});
});

router.get('/search', async (req: Request, res: Response) => {
	const { query } = req.query;
	if (!query) return res.json({ videos: [] });

	const videos = await database.video.findMany({
		where: {
			title: {
				contains: query as string,
			},
		},
		include: {
			author: true,
			thumbnail: true,
			media: true,
		},
	});

	return res.json({ videos: videos.map(VideoConverter.convert) });
});

router.get('/:videoId', async (req: Request, res: Response) => {
	const video = await database.video.findUnique({
		where: {
			id: req.params.videoId,
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

	return res.json(VideoConverter.convert(video));
});

const VideoUpdateSchema = RT.Record({
	title: RT.String.optional(),
	description: RT.String.optional(),
	tags: RT.Array(RT.String).optional(),
});

router.put('/:videoId', validateSchema(VideoUpdateSchema), async (req: Request, res: Response) => {
	const body = req.body as RT.Static<typeof VideoUpdateSchema>;

	const video = await database.video.findUnique({
		where: {
			id: req.params.videoId,
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

	if (video.author.id !== req.user!.id) {
		res.statusCode = 403;
		throw new Error('unauthorized');
	}

	await database.video.update({
		where: {
			id: req.params.videoId,
		},
		data: {
			title: body.title,
			description: body.description,
			tags: body.tags?.filter(Boolean).join(','),
		},
	});

	return res.json(VideoConverter.convert(video));
});
