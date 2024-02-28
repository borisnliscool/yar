import { Request, Response, Router } from 'express';
import { database } from '../services/databaseService';
import FileService from '../services/fileService';

export const router = Router();

// todo permissions

router.get('/:id', async (req: Request, res: Response) => {
	const media = await database.media.findFirst({
		where: {
			id: req.params.id,
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
