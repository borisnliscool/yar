<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$components/Header.svelte';
	import API from '$lib/api';
	import { SettingsKey, UserRole, type User } from '@repo/types';
	import { Input, Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	let settingsPromise: Promise<Record<SettingsKey, string>> | undefined;

	onMount(async () => {
		await API.get('/users/me')
			.then((r) => r.json())
			.then((user: User) => {
				if (!user.roles.includes(UserRole.ADMIN)) goto('/');
			})
			.catch(() => goto('/'));

		settingsPromise = API.get('/settings').then((r) => r.json());
	});
</script>

<svelte:head>
	<title>Instance Settings - YAR</title>
</svelte:head>

<Header />

<div class="grid place-items-center">
	<div class="flex w-full max-w-lg flex-col items-center gap-4 py-8">
		<p class="w-full">Instance Settings</p>

		{#await settingsPromise}
			<Skeleton class="h-10 w-full max-w-lg" />
			<Skeleton class="h-10 w-full max-w-lg" />
			<Skeleton class="h-10 w-full max-w-lg" />
		{:then settings}
			{#if settings}
				{#each Object.entries(settings) as [key, value]}
					<Input bind:value {key} />
				{/each}
			{/if}
		{:catch error}
			<p class="text-red-500">{error}</p>
		{/await}
	</div>
</div>
