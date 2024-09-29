import { StatsResponse, UserRole } from '@repo/types';
import { Request, Response, Router } from 'express';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);
router.use(AuthenticationService.hasRoles([UserRole.ADMIN]));

router.get('/', async (req: Request, res: Response) => {
	const [storageImages, storageVideo, totalDuration, videoCount] = await Promise.all([
		database.media
			.aggregate({
				_sum: {
					file_size: true,
				},
				where: {
					type: 'IMAGE',
				},
			})
			.then((r) => r._sum.file_size ?? 0),
		database.media
			.aggregate({
				_sum: {
					file_size: true,
				},
				where: {
					type: 'VIDEO',
				},
			})
			.then((r) => r._sum.file_size ?? 0),
		database.media
			.aggregate({
				_sum: {
					duration: true,
				},
				where: {
					type: 'VIDEO',
				},
			})
			.then((r) => r._sum.duration ?? 0),
		database.video.count(),
	]);

	const data: StatsResponse = {
		storage: {
			total: storageImages + storageVideo,
			images: storageImages,
			videos: storageVideo,
		},
		videos: {
			total: videoCount,
			totalDuration: totalDuration,
			averageDuration: totalDuration / videoCount,
		},
	};

	res.json(data);
});
