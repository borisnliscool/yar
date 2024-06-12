import { ErrorType } from '@repo/types';
import { Request, Response, Router } from 'express';
import { merge } from 'lodash';
import crypto from 'node:crypto';
import path from 'path';
import * as RT from 'runtypes';
import mediaConverter from '../converters/mediaConverter';
import videoConverter from '../converters/videoConverter';
import BodyParsers from '../middleware/bodyParsers';
import { rateLimit } from '../middleware/rateLimit';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import FFmpegService from '../services/ffmpegService';
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

		try {
			const videoInfo = await VideoDownloadService.getVideoInformation(body.url);
			res.setHeader('Cache-Control', 'max-age=3600');
			res.send(videoInfo);
		} catch (error) {
			return req.fail(ErrorType.INVALID_URL, 400, 'invalid url');
		}
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
		const body = req.body as RT.Static<typeof VideoUploadUrlSchema>;

		if (
			(await database.video.count({ where: { source_url: body.url.trim() } })) &&
			req.query.force !== 'true'
		) {
			return req.fail(ErrorType.MEDIA_ALREADY_EXISTS, 409, 'video already exists');
		}

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

			return req.fail(ErrorType.INTERNAL_SERVER_ERROR, 500, 'failed to upload video');
		});

		stream.on('data', (data) => FileService.appendFile('media', fileName, data));

		stream.on('progress', (data) => {
			if (!res.closed) {
				res.write(JSON.stringify(data) + '\n');
			}
		});

		stream.once('end', async () => {
			const ffprobeData = await FFmpegService.probe(
				path.join(FileService.getDirectoryPath('media'), fileName),
				false
			);
			const duration = ffprobeData?.streams[0].duration ?? null;

			const media = await database.media.create({
				data: {
					id,
					extension,
					type: 'VIDEO',
					mime_type: 'video/' + extension,
					file_size: FileService.getFileSize('media', fileName),
					duration: duration ? +duration : null,
				},
			});

			const thumbnailId = crypto.randomUUID();
			const thumbnailExtension = videoDetails.thumbnail
				.split('.')
				.at(-1)!
				.replace(/\?.*/, '');
			const thumbnailFileName = thumbnailId + '.' + thumbnailExtension;

			FileService.writeFile(
				'media',
				thumbnailFileName,
				await VideoDownloadService.thumbnail(videoDetails.thumbnail)
			);

			const thumbnailMedia = await database.media.create({
				data: {
					id: thumbnailId,
					extension: thumbnailExtension,
					type: 'IMAGE',
					mime_type: 'image/' + thumbnailExtension,
					file_size: FileService.getFileSize('media', thumbnailFileName),
				},
			});

			const video = await database.video.create({
				data: {
					title: body.title,
					author_id: req.user!.id,
					media_id: media.id,
					source_url: body.url,
					tags: body.tags
						.map((t) => t.trim())
						.filter(Boolean)
						.join(','),
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

			stream.destroy();
			stream.ytDlpProcess?.kill();
		});
	}
);

const VideoUploadFileSchema = RT.Record({
	ext: RT.String,
	title: RT.String,
	url: RT.String.optional(),
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
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'media not found');
	}

	if (!media.processing) {
		return req.fail(ErrorType.MEDIA_NOT_PROCESSING, 400, 'media not processing');
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
			return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'media not found');
		}

		if (!media.processing) {
			return req.fail(ErrorType.MEDIA_NOT_PROCESSING, 400, 'media not processing');
		}

		const videoFilePath = path.join(
			FileService.getDirectoryPath('media'),
			media.id + '.' + media.extension
		);
		const ffprobeData = await FFmpegService.probe(videoFilePath, false);

		const duration = ffprobeData?.streams[0].duration ?? null;
		media.duration = duration ? +duration : null;
		media.processing = false;
		media.file_size = FileService.getFileSize('media', media.id + '.' + media.extension);

		await database.media.update({
			where: {
				id: media.id,
			},
			data: media,
		});

		const thumbnailId = crypto.randomUUID();
		const thumbnailFilePath = path.join(
			FileService.getDirectoryPath('media'),
			thumbnailId + '.jpg'
		);

		await FFmpegService.generateThumbnail(videoFilePath, thumbnailFilePath);

		const thumbnailMedia = await database.media.create({
			data: {
				id: thumbnailId,
				extension: 'jpg',
				type: 'IMAGE',
				mime_type: 'image/jpg',
				file_size: FileService.getFileSize('media', thumbnailId + '.jpg'),
			},
		});

		const video = await database.video.create({
			data: {
				title: body.title,
				author_id: req.user!.id,
				media_id: media.id,
				tags: body.tags
					.map((t) => t.trim())
					.filter(Boolean)
					.join(','),
				source_url: body.url,
				thumbnail_id: thumbnailMedia.id,
			},
			include: {
				media: true,
				thumbnail: true,
				author: true,
			},
		});

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
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'media not found');
	}

	if (!media.processing) {
		return req.fail(ErrorType.MEDIA_NOT_PROCESSING, 400, 'media not processing');
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
