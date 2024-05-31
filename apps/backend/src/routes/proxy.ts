import { ErrorType } from '@repo/types';
import { Request, Response, Router } from 'express';
import AuthenticationService from '../services/authenticationService';

export const router = Router();

router.use(AuthenticationService.isAuthenticated);

router.get('/image/:url', async (req: Request, res: Response) => {
	const url = atob(req.params.url);
	try {
		new URL(url);
	} catch (err) {
		return req.fail(ErrorType.INVALID_URL, 400, 'invalid url');
	}

	const response = await fetch(url);
	if (!response.ok) {
		return req.fail(ErrorType.MEDIA_NOT_FOUND, 404, 'media not found');
	}

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
	return res.send(Buffer.from(buffer));
});

router.get('/latest-version', async (req: Request, res: Response) => {
	const response = await fetch('https://api.github.com/repos/borisnliscool/yar/git/refs/tags');

	if (!response.ok) {
		return req.fail(ErrorType.INTERNAL_SERVER_ERROR, 500, 'failed to get latest version');
	}

	const json = await response.json();

	const latest = json.at(-1) as {
		ref: string;
		node_id: string;
		url: string;
		object: {
			sha: string;
			type: string;
			url: string;
		};
	};

	return res.json({
		version: latest.ref.replace('refs/tags/', ''),
	});
});
