import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type ColorTheme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } = writable<ColorTheme>('light');

	return {
		subscribe,
		set: (value: ColorTheme) => {
			if (browser) localStorage.setItem('color-theme', value);
			set(value);
		},
		update: update
	};
}

export const theme = createThemeStore();
