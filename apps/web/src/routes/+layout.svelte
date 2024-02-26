<script lang="ts">
	import { theme, type ColorTheme } from '$lib/stores/theme';
	import '@fontsource-variable/inter';
	import { onMount } from 'svelte';
	import '../app.scss';

	const updateTheme = () => {
		const localStoragePref = localStorage.getItem('color-theme') as ColorTheme | undefined;
		const systemPref: ColorTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';

		theme.set(localStoragePref ?? systemPref);
	};

	onMount(updateTheme);
</script>

<svelte:window on:storage={(event) => event.key == 'color-theme' && updateTheme()} />

<main class="flex min-h-screen w-full flex-col" class:dark={$theme == 'dark'}>
	<slot />
</main>
