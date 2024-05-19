<script lang="ts">
	import '@fontsource-variable/inter';
	import '../app.scss';

	import ModalService from '$components/modalService/ModalService.svelte';
	import NotificationsContainer from '$components/notifications/NotificationsContainer.svelte';
	import { theme, type ColorTheme } from '$lib/stores/theme';
	import { onMount } from 'svelte';

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

<div class:dark={$theme == 'dark'}>
	<NotificationsContainer />
	<ModalService />
</div>

<main class:dark={$theme == 'dark'}>
	<div
		class="flex h-full min-h-screen w-full flex-col overflow-y-auto bg-white text-black dark:bg-neutral-900 dark:text-white"
	>
		<slot />
	</div>
</main>
