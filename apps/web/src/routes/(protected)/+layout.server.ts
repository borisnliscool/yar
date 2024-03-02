import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	if (!cookies.get('refreshToken')) throw redirect(303, '/login');
	return {};
}) satisfies LayoutServerLoad;
