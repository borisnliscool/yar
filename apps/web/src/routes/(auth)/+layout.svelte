<script lang="ts">
	import API from '$lib/api';
	import { SettingsKey } from '@repo/types';
	import { Button } from '@repo/ui';
	import { onMount } from 'svelte';

	const DEFAULT_AUTH_BACKGROUND = '/img/login-background.webp';

	let authBackground = '';
	let backgroundElement: HTMLDivElement;

	const onImageLoad = () => {
		backgroundElement.animate([{ opacity: 0 }, { opacity: 1 }], {
			duration: 2000,
			fill: 'forwards',
			easing: 'ease-in-out'
		});
	};

	const loadAuthBackgroundSetting = async () => {
		const response = await API.get('settings/' + SettingsKey.AUTH_BACKGROUND_URL, {
			noAuth: true
		});

		const data = await response.json();
		const url = data[SettingsKey.AUTH_BACKGROUND_URL] as string;

		authBackground = url.trim().length > 0 ? url : DEFAULT_AUTH_BACKGROUND;
	};

	onMount(loadAuthBackgroundSetting);
</script>

<div
	class="relative z-0 flex h-screen w-full flex-col items-center justify-center bg-black px-4 sm:p-0 dark:text-white"
>
	{#if authBackground}
		<div bind:this={backgroundElement} class="absolute -z-10 h-full w-full opacity-0">
			<img
				class="h-full w-full object-cover blur-sm lg:blur-lg"
				src={authBackground}
				alt="login background"
				on:error={() => (authBackground = DEFAULT_AUTH_BACKGROUND)}
				on:load={onImageLoad}
			/>
		</div>
	{/if}

	<div
		class="z-10 mx-auto flex w-full max-w-sm rounded-lg border bg-white/95 px-6 py-8 shadow-xl backdrop-blur-md sm:p-8 dark:border-neutral-600 dark:bg-neutral-800/95"
	>
		<slot />
	</div>

	{#if authBackground === DEFAULT_AUTH_BACKGROUND}
		<footer class="absolute bottom-0 left-0 right-0 flex w-full justify-end p-2 text-white">
			<p class="flex gap-1 text-xs">
				Background by
				<Button
					size="none"
					variant="link"
					target="_blank"
					href="https://unsplash.com/@vackground?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
				>
					vackground.com
				</Button>
				on
				<Button
					size="none"
					variant="link"
					target="_blank"
					href="https://unsplash.com/photos/a-blue-and-pink-abstract-background-with-wavy-lines-agUC-v_D1iI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
				>
					Unsplash
				</Button>
			</p>
		</footer>
	{/if}
</div>
