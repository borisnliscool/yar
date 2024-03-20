import { Request, Response, Router } from 'express';
import AuthenticationService from '../services/authenticationService';
import { database } from '../services/databaseService';
import FileService from '../services/fileService';

export const router = Router();

// todo request width query param
//  maybe don't serve videos

router.get('/:mediaId', AuthenticationService.media, async (req: Request, res: Response) => {
	const media = await database.media.findFirst({
		where: {
			id: req.params.mediaId,
		},
	});

	if (!media) {
		res.statusCode = 404;
		throw new Error('media not found');
	}

	const file = FileService.readFile('media', `${media.id}.${media.extension}`);

	res.setHeader('Content-Type', media.mime_type);
	return res.send(file);
});
