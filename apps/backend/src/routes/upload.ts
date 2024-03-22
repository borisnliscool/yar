import { Request, Response, Router } from 'express';
import { merge } from 'lodash';
import crypto from 'node:crypto';
import * as RT from 'runtypes';
import videoConverter from '../converters/videoConverter';
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

		const extension =
			body.ext ?? (await VideoDownloadService.getVideoInformation(body.url)).ext;
		const stream = await VideoDownloadService.download(body.url);

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

			// todo video tags & thumbnail

			const video = await database.video.create({
				data: {
					title: body.title,
					author_id: req.user!.id,
					mediaId: media.id,
					source_url: body.url,
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
