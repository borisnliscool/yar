import { Request, Response, Router } from 'express';
import * as RT from 'runtypes';
import { rateLimit } from '../middleware/rateLimit';
import { validateSchema } from '../middleware/schemaValidation';
import AuthenticationService from '../services/authenticationService';
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
