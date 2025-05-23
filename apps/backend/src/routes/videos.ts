import { ErrorType } from '@repo/types';
import crypto from 'crypto';
import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as RT from 'runtypes';
import VideoConverter from '../converters/videoConverter';
import { rateLimit } from '../middleware/rateLimit';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import FFmpegService from '../services/ffmpegService';
import FileService from '../services/fileService';
import MediaService from '../services/mediaService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/', rateLimit(), async (req: Request, res: Response) => {
	const allVideoIds = await database.video
		.findMany({
			select: {
				id: true,
			},
		})
		.then((r) => r.map((v) => v.id));

	const { page: _page, count: _count, seed: _seed } = req.query;

	const count = Math.min(parseInt(_count as string, 10) || 20, 100);
	const page = Math.min(
		Math.max(parseInt(_page as string, 10) || 0, 0),
		Math.ceil(allVideoIds.length / count) - 1
	);

	const seed = String(_seed || Math.random());

	// Shuffle the array of all video IDs based on the seed
	const shuffledVideoIds = allVideoIds
		.map((id) => ({
			id,
			sort: crypto
				.createHash('md5')
				.update(seed.toString() + id)
				.digest('hex'),
		}))
		.sort((a, b) => a.sort.localeCompare(b.sort))
		.map(({ id }) => id);

	const slicedVideoIds = shuffledVideoIds.slice(page * count, (page + 1) * count);

	const databaseVideos = await database.video.findMany({
		where: {
			id: {
				in: slicedVideoIds,
			},
		},
		include: {
			author: true,
			thumbnail: true,
			media: true,
		},
		orderBy: {
			created_at: 'desc',
		},
	});

	res.json({
		videos: databaseVideos.map(VideoConverter.convert),
		page: Math.max(page, 0),
		total: allVideoIds.length,
	});
});

router.get(
	'/search',
	rateLimit({
		max: 10,
		window: 5_000,
	}),
	async (req: Request, res: Response) => {
		if (!req.query.query) {
			res.json({ videos: [] });
			return;
		}

		const page: number = (req.query.page && +req.query.page) || 0;
		const query = `%${decodeURIComponent(req.query.query as string)
			.split(' ')
			.join('%')}%`;

		const videosIds = (
			(await database.$queryRaw`SELECT v.id FROM video v JOIN media m ON v.media_id = m.id WHERE (v.title LIKE ${query} OR v.description LIKE ${query} OR v.tags LIKE ${query}) AND m.processing = false ORDER BY v.created_at DESC LIMIT 10 OFFSET ${Math.max(page * 10, 0)};`) as {
				id: string;
			}[]
		).map((v) => v.id);

		const videos = await database.video.findMany({
			where: {
				id: {
					in: videosIds,
				},
			},
			include: {
				author: true,
				thumbnail: true,
				media: true,
			},
		});

		videos.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

		const total =
			(await database.$queryRaw`SELECT COUNT(v.id) as video_count FROM video v JOIN media m ON v.media_id = m.id WHERE (v.title LIKE ${query} OR v.description LIKE ${query} OR v.tags LIKE ${query}) AND m.processing = false ORDER BY v.created_at;`) as {
				video_count: number;
			}[];

		res.json({
			videos: videos.map(VideoConverter.convert),
			total: Number(total[0].video_count),
		});
	}
);

router.get('/tags', async (_: Request, res: Response) => {
	const tags = await database.video.groupBy({
		by: ['tags'],
		_count: {
			_all: true,
		},
	});

	res.json({
		tags: [
			...new Set(
				tags.flatMap((t) =>
					t.tags
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean)
				)
			),
		],
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
			media: true,
		},
	});

	if (!video) {
		req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
		return;
	}

	res.json(VideoConverter.convert(video));
});

const VideoUpdateSchema = RT.Record({
	title: RT.String.optional(),
	description: RT.String.optional(),
	tags: RT.Array(RT.String).optional(),
});

router.put(
	'/:videoId',
	rateLimit(),
	validateSchema(VideoUpdateSchema),
	async (req: Request, res: Response) => {
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
			req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
			return;
		}

		if (video.author.id !== req.user!.id) {
			req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
			return;
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

		res.json(VideoConverter.convert(video));
	}
);

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
		req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
		return;
	}

	if (video.author.id !== req.user!.id) {
		req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
		return;
	}

	const thumbnail = req.files && Object.values(req.files)[0];
	if (!thumbnail) {
		req.fail(ErrorType.INVALID_MEDIA, 400, 'invalid media');
		return;
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
	const thumbnailFileName = thumbnailId + '.' + file.originalname.split('.').at(-1)!;

	FileService.writeFile('temp', thumbnailFileName, file.buffer);

	const convertedFile = await FFmpegService.convertFile(
		path.join(FileService.getDirectoryPath('temp'), thumbnailFileName),
		path.join(FileService.getDirectoryPath('media'), thumbnailId + '.webp'),
		['-vf scale=720:-1']
	);

	FileService.deleteFile('temp', thumbnailFileName);

	const thumbnailMedia = await database.media.create({
		data: {
			id: thumbnailId,
			extension: 'webp',
			type: 'IMAGE',
			mime_type: 'image/webp',
			file_size: convertedFile.size,
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

	res.json(VideoConverter.convert(video));
});

router.post('/:videoId/thumbnail/regenerate', async (req: Request, res: Response) => {
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
		req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
		return;
	}

	if (video.author.id !== req.user!.id) {
		req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
		return;
	}

	const videoFilePath = path.join(
		FileService.getDirectoryPath('media'),
		video.media.id + '.' + video.media.extension
	);

	const newThumbnailId = crypto.randomUUID();
	const newThumbnailFilePath = path.join(
		FileService.getDirectoryPath('media'),
		newThumbnailId + '.webp'
	);

	const newThumbnailFile = await FFmpegService.generateThumbnail(
		videoFilePath,
		newThumbnailFilePath
	);

	const newThumbnailMedia = await database.media.create({
		data: {
			id: newThumbnailId,
			extension: 'webp',
			type: 'IMAGE',
			mime_type: 'image/webp',
			file_size: newThumbnailFile.size,
		},
	});

	const updatedVideo = await database.video.update({
		where: {
			id: video.id,
		},
		data: {
			thumbnail_id: newThumbnailMedia.id,
		},
		include: {
			author: true,
			thumbnail: true,
			media: true,
		},
	});

	if (video.thumbnail) MediaService.deleteMediaFile(video.thumbnail);

	res.json(VideoConverter.convert(updatedVideo));
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
		req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
		return;
	}

	if (video.author.id !== req.user!.id) {
		req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
		return;
	}

	const mediasToDelete = [video.media_id];
	if (video.thumbnail_id) mediasToDelete.push(video.thumbnail_id);

	await database.$transaction([
		database.video.delete({
			where: {
				id: video.id,
			},
		}),
		database.media.deleteMany({
			where: {
				id: {
					in: mediasToDelete,
				},
			},
		}),
	]);

	MediaService.deleteMediaFile(video.media);
	if (video.thumbnail) MediaService.deleteMediaFile(video.thumbnail);

	res.json({
		success: true,
	});
});
