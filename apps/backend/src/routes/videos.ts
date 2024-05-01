import crypto from 'crypto';
import { Request, Response, Router } from 'express';
import { shuffle } from 'lodash';
import multer from 'multer';
import * as RT from 'runtypes';
import VideoConverter from '../converters/videoConverter';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import FileService from '../services/fileService';
import MediaService from '../services/mediaService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/', async (req: Request, res: Response) => {
	const total = await database.video.count();

	const { page: _page, count: _count } = req.query;
	const count = Math.min(+(_count ?? 20), 100);
	const page = Math.min(Math.max(+(_page ?? 0), 0), Math.ceil(total / count) - 1);

	const databaseVideos = await database.video.findMany({
		take: count,
		skip: count * page,
		include: {
			author: true,
			thumbnail: true,
			media: true,
		},
	});

	const videos = databaseVideos.map(VideoConverter.convert);

	return res.json({
		videos: shuffle(videos),
		page: page,
		total: total,
	});
});

router.get('/search', async (req: Request, res: Response) => {
	const { query } = req.query;
	if (!query) return res.json({ videos: [] });

	const videos = await database.video.findMany({
		where: {
			OR: [
				{
					title: {
						contains: query as string,
					},
				},
				{
					description: {
						contains: query as string,
					},
				},
				{
					tags: {
						contains: query as string,
					},
				},
			],
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
			tags: body.tags
				?.map((t) => t.trim())
				.filter(Boolean)
				.join(','),
		},
	});

	return res.json(VideoConverter.convert(video));
});

const upload = multer({
	storage: multer.memoryStorage(),
});

router.put('/:videoId/thumbnail', upload.any(), async (req: Request, res: Response) => {
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

	const thumbnail = req.files && Object.values(req.files)[0];
	if (!thumbnail) {
		throw new Error('thumbnail not found');
	}

	const file = thumbnail as Express.Multer.File;

	if (video.thumbnail) {
		MediaService.deleteMediaFile(video.thumbnail);
		await database.media.delete({
			where: {
				id: video.thumbnail?.id,
			},
		});
	}

	const thumbnailId = crypto.randomUUID();
	const thumbnailExtension = file.originalname.split('.').at(-1)!;

	// TODO: converting the file to the correct format, like webp or png
	FileService.writeFile('media', thumbnailId + '.' + thumbnailExtension, file.buffer);

	const thumbnailMedia = await database.media.create({
		data: {
			id: thumbnailId,
			extension: thumbnailExtension,
			type: 'IMAGE',
			mime_type: file.mimetype,
		},
	});

	await database.video.update({
		where: {
			id: video.id,
		},
		data: {
			thumbnail_id: thumbnailMedia.id,
		},
	});

	return res.json(VideoConverter.convert(video));
});

router.delete('/:videoId', async (req: Request, res: Response) => {
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

	await database.video.delete({
		where: {
			id: video.id,
		},
		include: {
			media: true,
			thumbnail: true,
		},
	});

	MediaService.deleteMediaFile(video.media);
	if (video.thumbnail) MediaService.deleteMediaFile(video.thumbnail);

	return res.json({
		success: true,
	});
});
