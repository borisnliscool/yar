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

<main class:dark={$theme == 'dark'}>
	<div
		class="white flex min-h-screen w-full flex-col bg-white text-black dark:bg-neutral-800 dark:text-white"
	>
		<slot />
	</div>
</main>
