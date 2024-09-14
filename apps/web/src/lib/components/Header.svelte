<script lang="ts">
	import { goto } from '$app/navigation';
	import API from '$lib/api';
	import { theme } from '$lib/stores/theme';
	import { userStore } from '$lib/stores/user';
	import Icon from '@iconify/svelte';
	import { SettingsKey, UserRole } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { onMount } from 'svelte';

	export let searchQuery = '';
	let mobileMenu = false;

	let instanceTitle = '';

	const input = (event: KeyboardEvent) => {
		if (event.key == 'Enter') {
			const search = searchQuery.trim();
			if (!search) return;
			return goto('/search/' + searchQuery);
		}
	};

	const loadInstanceTitleSetting = async () => {
		const response = await API.get('settings/' + SettingsKey.INSTANCE_TITLE);

		const data = await response.json();
		instanceTitle = data[SettingsKey.INSTANCE_TITLE] as string;
	};

	onMount(loadInstanceTitleSetting);
</script>

<div class="h-16"></div>

<header
	class="fixed top-0 z-[100] grid h-16 max-h-16 min-h-16 w-full grid-cols-9 place-items-center gap-4 border-b bg-white/95 px-4 shadow-sm backdrop-blur-lg md:gap-0 md:px-8 dark:border-b-neutral-700 dark:bg-neutral-800/95"
>
	<div class="text-md col-span-2 hidden w-full md:block">
		<a href="/" class="group flex items-center gap-4">
			<picture>
				<source srcset="/logo.webp" type="image/webp" />
				<img class="max-h-8" src="/logo.png" alt="Youtube Archive Logo" loading="eager" />
			</picture>

			{#if instanceTitle.length}
				<p
					class="bg-gradient-to-br from-orange-500 to-purple-500 bg-clip-text font-medium transition-colors group-hover:text-transparent"
				>
					{instanceTitle}
				</p>
			{/if}
		</a>
	</div>

	<div class="col-span-8 w-full max-w-[30rem] md:col-span-5">
		<Input
			type="search"
			class="w-full rounded-full px-4"
			placeholder="Search for videos"
			bind:value={searchQuery}
			on:keyup={input}
		/>
	</div>

	<div class="col-span-2 hidden w-full items-center justify-end md:flex">
		<Button
			variant="ghost"
			on:click={() => ($theme = $theme == 'dark' ? 'light' : 'dark')}
			class="grid h-10 w-12 place-items-center text-lg"
		>
			{#if $theme == 'dark'}
				<Icon icon="fa6-solid:sun" />
			{:else}
				<Icon icon="fa6-solid:moon" />
			{/if}
		</Button>

		<Button variant="ghost" href="/upload" class="grid h-10 w-12 place-items-center text-2xl">
			<Icon icon="ri:video-upload-line" />
		</Button>

		<Button
			variant="ghost"
			href="/profile"
			class="grid h-10 w-12 place-items-center text-lg text-black hover:underline dark:text-white"
		>
			<Icon icon="fa6-solid:user" />
		</Button>

		{#if $userStore && $userStore.roles.includes(UserRole.ADMIN)}
			<Button
				variant="ghost"
				href="/settings"
				class="grid h-10 w-12 place-items-center text-lg text-black hover:underline dark:text-white"
			>
				<Icon icon="fa6-solid:gear" />
			</Button>
		{/if}

		<Button
			variant="ghost"
			href="/logout"
			data-sveltekit-preload-data="off"
			class="py-2 pl-4 text-lg text-black hover:underline dark:text-white"
		>
			<Icon icon="fa6-solid:right-from-bracket" />
		</Button>
	</div>

	<div class="col-span-1 grid place-items-center md:hidden">
		<Button on:click={() => (mobileMenu = !mobileMenu)} variant="ghost">
			<Icon icon="fa6-solid:bars" />
		</Button>
	</div>
</header>

{#if mobileMenu}
	<div
		class="fixed top-16 z-10 h-[calc(100vh-4rem)] w-full bg-white/95 backdrop-blur-md dark:bg-neutral-800/95"
	>
		<div class="flex flex-col gap-4 p-6">
			<Button variant="ghost" href="/" class="flex items-center justify-start gap-4 p-0 text-base">
				<div class="grid h-10 w-12 place-items-center text-xl">
					<picture>
						<source srcset="/logo.webp" type="image/webp" />
						<img class="max-h-6" src="/logo.png" alt="Youtube Archive Logo" loading="eager" />
					</picture>
				</div>

				<span
					class="bg-gradient-to-br from-orange-500 to-purple-500 bg-clip-text font-medium text-transparent transition-colors"
				>
					Home
				</span>
			</Button>

			<Button
				variant="ghost"
				on:click={() => ($theme = $theme == 'dark' ? 'light' : 'dark')}
				class="flex items-center justify-start gap-4 p-0 text-base"
			>
				<div class="grid h-10 w-12 place-items-center text-xl">
					{#if $theme == 'dark'}
						<Icon icon="fa6-solid:sun" />
					{:else}
						<Icon icon="fa6-solid:moon" />
					{/if}
				</div>

				Toggle theme
			</Button>

			<Button
				variant="ghost"
				href="/upload"
				class="flex items-center justify-start gap-4 p-0 text-base"
			>
				<div class="grid h-10 w-12 place-items-center text-2xl">
					<Icon icon="ri:video-upload-line" />
				</div>

				Upload
			</Button>

			<Button
				variant="ghost"
				href="/profile"
				class="flex items-center justify-start gap-4 p-0 text-base"
			>
				<div class="grid h-10 w-12 place-items-center text-xl">
					<Icon icon="fa6-solid:user" />
				</div>

				Profile
			</Button>

			<Button
				variant="ghost"
				href="/settings"
				class="flex items-center justify-start gap-4 p-0 text-base"
			>
				<div class="grid h-10 w-12 place-items-center text-xl">
					<Icon icon="fa6-solid:gear" />
				</div>

				Settings
			</Button>

			<Button
				variant="ghost"
				href="/logout"
				data-sveltekit-preload-data="off"
				class="flex items-center justify-start gap-4 p-0 text-base"
			>
				<div class="grid h-10 w-12 place-items-center text-xl">
					<Icon icon="fa6-solid:right-from-bracket" />
				</div>

				Logout
			</Button>
		</div>

		<Button
			variant="ghost"
			on:click={() => (mobileMenu = false)}
			class="h-full max-h-none w-full"
		/>
	</div>
{/if}
