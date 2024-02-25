import type { User } from '@repo/types';
import type { RequestEvent } from '@sveltejs/kit';

export const authenticateUser = async (event: RequestEvent): Promise<User | undefined> => {
	const { cookies } = event;

	return {
		uid: crypto.randomUUID(),
		username: 'John Doe'
	};
};
