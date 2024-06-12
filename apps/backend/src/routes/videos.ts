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
	const total = await database.video.count();

	const { page: _page, count: _count } = req.query;
	const count = Math.min(+(_count ?? 20), 100);
	const page = Math.min(Math.max(+(_page ?? 0), 0), Math.ceil(total / count) - 1);

	const databaseVideos = await database.video.findMany({
		take: count,
		skip: Math.max(count * page, 0),
		include: {
			author: true,
			thumbnail: true,
			media: true,
		},
		orderBy: {
			created_at: 'desc',
		},
	});

	return res.json({
		videos: databaseVideos.map(VideoConverter.convert),
		page: Math.max(page, 0),
		total: total,
	});
});

router.get(
	'/search',
	rateLimit({
		max: 3,
	}),
	async (req: Request, res: Response) => {
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
				media: {
					NOT: {
						processing: true,
					},
				},
			},
			include: {
				author: true,
				thumbnail: true,
				media: true,
			},
		});

		return res.json({ videos: videos.map(VideoConverter.convert) });
	}
);

router.get('/tags', async (_: Request, res: Response) => {
	const tags = await database.video.groupBy({
		by: ['tags'],
		_count: {
			_all: true,
		},
	});

	return res.json({
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
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
	}

	return res.json(VideoConverter.convert(video));
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
			return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
		}

		if (video.author.id !== req.user!.id) {
			return req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
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
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
	}

	if (video.author.id !== req.user!.id) {
		return req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
	}

	const thumbnail = req.files && Object.values(req.files)[0];
	if (!thumbnail) {
		return req.fail(ErrorType.INVALID_MEDIA, 400, 'invalid media');
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

	return res.json(VideoConverter.convert(video));
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
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
	}

	if (video.author.id !== req.user!.id) {
		return req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
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

	return res.json(VideoConverter.convert(updatedVideo));
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
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'video not found');
	}

	if (video.author.id !== req.user!.id) {
		return req.fail(ErrorType.UNAUTHORIZED, 403, 'unauthorized');
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

	return res.json({
		success: true,
	});
});
