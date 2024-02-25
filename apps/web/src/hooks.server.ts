import { authenticateUser } from '$lib/authentication';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const user = await authenticateUser(event);
	event.locals.user = user;

	return resolve(event);
};
