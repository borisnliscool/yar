<script lang="ts">
	import { goto } from '$app/navigation';
	import { theme } from '$lib/stores/theme';
	import Icon from '@iconify/svelte';
	import { Input } from '@repo/ui';

	let searchValue = '';

	const input = (event: KeyboardEvent) => {
		if (event.key == 'Enter') {
			const search = searchValue.trim();
			if (!search) return;
			return goto('/search/' + searchValue);
		}
	};
</script>

<header
	class="sticky top-0 z-[100] grid h-16 max-h-16 min-h-16 w-full grid-cols-5 place-items-center border-b bg-white/95 px-8 shadow-sm backdrop-blur-lg dark:border-b-neutral-700 dark:bg-neutral-800/95"
>
	<div class="text-md w-full">
		<a href="/" class="group flex items-center gap-4">
			<picture>
				<source srcset="/logo.webp" type="image/webp" />
				<img class="max-h-8" src="/logo.png" alt="Youtube Archive Logo" loading="eager" />
			</picture>

			<p
				class="bg-gradient-to-br from-orange-500 to-purple-500 bg-clip-text font-medium transition-colors group-hover:text-transparent"
			>
				Youtube Archive
			</p>
		</a>
	</div>

	<div class="col-span-3 w-full min-w-[20rem] max-w-[30rem]">
		<Input
			type="search"
			class="w-full rounded-full px-4"
			placeholder="Search for videos"
			bind:value={searchValue}
			on:keyup={input}
		/>
	</div>

	<div class="flex w-full items-center justify-end">
		<button
			on:click={() => ($theme = $theme == 'dark' ? 'light' : 'dark')}
			class="grid h-10 w-12 place-items-center text-lg"
		>
			{#if $theme == 'dark'}
				<Icon icon="fa6-solid:sun" />
			{:else}
				<Icon icon="fa6-solid:moon" />
			{/if}
		</button>

		<a href="/upload" class="grid h-10 w-12 place-items-center text-2xl">
			<Icon icon="ri:video-upload-line" />
		</a>

		<a
			href="/profile"
			class="grid h-10 w-12 place-items-center text-lg text-black hover:underline dark:text-white"
		>
			<Icon icon="fa6-solid:user" />
		</a>

		<a
			href="/logout"
			data-sveltekit-preload-data="off"
			class="py-2 pl-4 text-sm text-black hover:underline dark:text-white"
		>
			Logout
		</a>
	</div>
</header>
