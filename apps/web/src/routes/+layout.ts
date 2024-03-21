import type { LayoutLoad } from './$types';

export const prerender = false;
export const ssr = false;
export const csr = true;

export const load = (async () => {
	return {};
}) satisfies LayoutLoad;
