import { Request, Response, Router } from 'express';
import { merge } from 'lodash';
import crypto from 'node:crypto';
import * as RT from 'runtypes';
import mediaConverter from '../converters/mediaConverter';
import videoConverter from '../converters/videoConverter';
import BodyParsers from '../middleware/bodyParsers';
import { rateLimit } from '../middleware/rateLimit';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import FileService from '../services/fileService';
import VideoDownloadService from '../services/videoDownloadService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

const VideoInfoSchema = RT.Record({
	url: RT.String,
});

router.post(
	'/info',
	validateSchema(VideoInfoSchema),
	rateLimit({
		window: 60 * 60,
		max: 5,
	}),
	async (req: Request, res: Response) => {
		const body = req.body as RT.Static<typeof VideoInfoSchema>;

		// todo cache this
		const videoInfo = await VideoDownloadService.getVideoInformation(body.url);

		res.setHeader('Cache-Control', 'max-age=3600');
		res.send(videoInfo);
	}
);

const VideoUploadUrlSchema = RT.Record({
	url: RT.String,
	ext: RT.String.optional(),
	input: RT.String,
	title: RT.String,
	tags: RT.Array(RT.String),
});

router.post(
	'/url',
	validateSchema(VideoUploadUrlSchema),
	rateLimit({ window: 60 * 60, max: 5 }),
	async (req: Request, res: Response) => {
		// todo: either deny uploading videos with url's that already exist in the database, or show a warning

		const body = req.body as RT.Static<typeof VideoUploadUrlSchema>;

		const videoDetails = await VideoDownloadService.getVideoInformation(body.input);
		const stream = await VideoDownloadService.download(body.url);
		const extension = body.ext ?? videoDetails.ext;

		const id = crypto.randomUUID();
		const fileName = id + '.' + extension;

		stream.once('error', (err) => {
			console.error(err);

			res.statusCode = 500;
			res.errorDetails = merge(res.errorDetails ?? {}, {
				videoUpload: err.message,
			});

			throw new Error('Failed to upload video');
		});

		stream.on('data', (data) => FileService.appendFile('media', fileName, data));

		stream.on('progress', (data) => {
			if (!res.closed) {
				res.write(JSON.stringify(data) + '\n');
			}
		});

		stream.once('end', async () => {
			const media = await database.media.create({
				data: {
					id,
					extension,
					type: 'VIDEO',
					mime_type: 'video/' + extension,
				},
			});

			const thumbnailId = crypto.randomUUID();
			const thumbnailExtension = videoDetails.thumbnail.split('.').at(-1)!;

			FileService.writeFile(
				'media',
				thumbnailId + '.' + thumbnailExtension,
				await VideoDownloadService.thumbnail(videoDetails.thumbnail)
			);

			const thumbnailMedia = await database.media.create({
				data: {
					id: thumbnailId,
					extension: thumbnailExtension,
					type: 'IMAGE',
					mime_type: 'image/' + thumbnailExtension,
				},
			});

			const video = await database.video.create({
				data: {
					title: body.title,
					author_id: req.user!.id,
					mediaId: media.id,
					source_url: body.url,
					tags: body.tags.filter(Boolean).join(','),
					thumbnail_id: thumbnailMedia.id,
				},
				include: {
					media: true,
					thumbnail: true,
					author: true,
				},
			});

			res.end(
				JSON.stringify({
					success: true,
					video: videoConverter.convert(video),
				}) + '\n'
			);
		});
	}
);

const VideoUploadFileSchema = RT.Record({
	ext: RT.String,
	title: RT.String,
	tags: RT.Array(RT.String),
});

router.post(
	'/file',
	validateSchema(VideoUploadFileSchema),
	rateLimit({ window: 60 * 60, max: 5 }),
	async (req: Request, res: Response) => {
		const body = req.body as RT.Static<typeof VideoUploadFileSchema>;
		const id = crypto.randomUUID();
		const fileName = id + '.' + body.ext;

		const media = await database.media.create({
			data: {
				id,
				extension: body.ext,
				type: 'VIDEO',
				mime_type: 'video/' + body.ext,
				processing: true,
			},
		});

		FileService.writeFile('media', fileName, '');

		return res.json(mediaConverter.convert(media));
	}
);

router.post('/file/:mediaId/part', BodyParsers.raw, async (req: Request, res: Response) => {
	const media = await database.media.findUnique({
		where: {
			id: req.params.mediaId,
		},
	});

	if (!media) {
		throw new Error('media not found');
	}

	if (!media.processing) {
		throw new Error('media not processing');
	}

	const fileName = `${media.id}.${media.extension}`;
	FileService.appendFile('media', fileName, req.body);

	return res.json({
		success: true,
	});
});

router.post(
	'/file/:mediaId/complete',
	validateSchema(VideoUploadFileSchema),
	async (req: Request, res: Response) => {
		const body = req.body as RT.Static<typeof VideoUploadFileSchema>;

		const media = await database.media.findUnique({
			where: {
				id: req.params.mediaId,
			},
		});

		if (!media) {
			throw new Error('media not found');
		}

		if (!media.processing) {
			throw new Error('media not processing');
		}

		media.processing = false;

		await database.media.update({
			where: {
				id: media.id,
			},
			data: media,
		});

		const video = await database.video.create({
			data: {
				title: body.title,
				author_id: req.user!.id,
				mediaId: media.id,
				tags: body.tags.join(','),
			},
			include: {
				media: true,
				thumbnail: true,
				author: true,
			},
		});

		// todo get thumbnail from body, or generate one from the video

		return res.json(videoConverter.convert(video));
	}
);

router.post('/file/:mediaId/cancel', async (req: Request, res: Response) => {
	const media = await database.media.findUnique({
		where: {
			id: req.params.mediaId,
		},
	});

	if (!media) {
		throw new Error('media not found');
	}

	if (!media.processing) {
		throw new Error('media not processing');
	}

	await database.media.delete({
		where: {
			id: media.id,
		},
	});

	FileService.deleteFile('media', `${media.id}.${media.extension}`);

	return res.json({
		success: true,
	});
});
