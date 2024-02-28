import { Video } from '@repo/types';
import { Request, Response, Router } from 'express';
import { database } from '../services/databaseService';
import MediaService from '../services/mediaService';

export const router = Router();

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

	const videos: Video[] = [];

	// todo: this conversion of dbVideo to Video should be moved to a more general place

	for (const dbVideo of databaseVideos) {
		const video: Video = {
			id: dbVideo.id,
			created_at: dbVideo.created_at,
			updated_at: dbVideo.updated_at,
			title: dbVideo.title,
			author: {
				id: dbVideo.author.id,
				username: dbVideo.author.username,
				created_at: dbVideo.author.created_at,
			},
		};

		if (dbVideo.thumbnail) {
			video.thumbnail = {
				id: dbVideo.thumbnail.id,
				created_at: dbVideo.thumbnail.created_at,
				updated_at: dbVideo.thumbnail.updated_at,
				mime_type: dbVideo.thumbnail.mime_type,
				url: MediaService.getMediaUrl(dbVideo.thumbnail.id),
				type: dbVideo.thumbnail.type,
				height: dbVideo.thumbnail.height ?? undefined,
				width: dbVideo.thumbnail.width ?? undefined,
			};
		}

		videos.push(video);
	}

	return res.json({
		videos,
	});
});
