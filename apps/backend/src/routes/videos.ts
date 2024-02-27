import { Request, Response, Router } from 'express';
import { database } from '../services/databaseService';

export const router = Router();

router.get('/', async (req: Request, res: Response) => {
	const { skip, count } = req.query;

	const videos = await database.video.findMany({
		take: Math.min(count ? +count : 20, 100),
		skip: skip ? +skip : 0,
		include: {
			author: true,
			thumbnail: true,
		},
	});

	// todo: setting the thumbnail url for every video, maybe a media service?

	await new Promise((r) => setTimeout(r, 1000));

	return res.json({
		videos,
	});
});
