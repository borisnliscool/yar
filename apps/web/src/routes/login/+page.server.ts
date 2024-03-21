import API from '$lib/api';
import { fail, type Actions } from '@sveltejs/kit';
import ms from 'ms';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		const response = await API.post(
			'/auth/login',
			{
				username,
				password
			},
			{
				noAuth: true
			}
		);

		if (!response.ok) return fail(401);

		const data = (await response.json()) as { accessToken: string; refreshToken: string };

		cookies.set('refreshToken', data.refreshToken, {
			path: '/',
			httpOnly: true,
			maxAge: ms('1w') / 1000
		});

		return {
			accessToken: data.accessToken
		};
	}
};
