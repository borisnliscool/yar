import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const createVolumeStore = () => {
	const { subscribe, set, update } = writable(
		browser ? parseInt(localStorage.getItem('volume') || '1') : 1
	);

	return {
		subscribe,
		set: (value: number) => {
			if (browser) localStorage.setItem('volume', value.toString());
			set(value);
		},
		update: (value: number) => {
			if (browser) localStorage.setItem('volume', value.toString());
			update(() => value);
		}
	};
};
