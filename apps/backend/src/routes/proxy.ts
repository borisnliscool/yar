import { Request, Response, Router } from 'express';
import AuthenticationService from '../services/authenticationService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/image/:url', async (req: Request, res: Response) => {
	const url = atob(req.params.url);
	try {
		new URL(url);
	} catch (err) {
		throw Error('invalid url');
	}

	const response = await fetch(url);
	if (!response.ok) throw Error('failed to perform request');

	const addHeader = (name: string) => {
		const header = response.headers.get(name);
		if (header) res.setHeader(name, header);
	};

	addHeader('Content-Type');
	addHeader('Content-Length');
	addHeader('Cache-Control');

	const blob = await response.blob();
	res.type(blob.type);

	const buffer = await blob.arrayBuffer();
	res.send(Buffer.from(buffer));
});
