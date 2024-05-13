<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$components/Header.svelte';
	import API from '$lib/api';
	import { SettingsKey, UserRole, type Setting, type User } from '@repo/types';
	import { Checkbox, Input, Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	let settingsPromise: Promise<Record<SettingsKey, Setting>> | undefined;
	let settings: { key: SettingsKey; setting: Setting }[];
	let loaded = false;

	onMount(async () => {
		await API.get('/users/me')
			.then((r) => r.json())
			.then((user: User) => {
				if (!user.roles.includes(UserRole.ADMIN)) goto('/');
			})
			.catch(() => goto('/'));

		settingsPromise = API.get('/settings').then((r) => r.json());

		settings = Object.entries(await settingsPromise).map(([key, setting]) => ({
			key: key as SettingsKey,
			setting: setting as Setting
		}));
	});

	const getInputForSetting = (setting: Setting) => {
		switch (setting.type) {
			case 'BOOLEAN':
				return Checkbox;
			case 'NUMBER':
			case 'STRING':
			default:
				return Input;
		}
	};

	$: {
		if (settings) {
			if (loaded) {
				for (const setting of settings) {
					const value =
						setting.setting.type === 'BOOLEAN'
							? `${setting.setting.value}` === 'true'
							: setting.setting.value;

					API.put('/settings/' + setting.key, { value });
				}
			}

			loaded = true;
		}
	}
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
		{:then _}
			{#if settings}
				<div class="flex w-full flex-col gap-2">
					{#each settings as s}
						<div class="flex items-center gap-4">
							<svelte:component
								this={getInputForSetting(s.setting)}
								bind:value={s.setting.value}
								type={s.setting.type.toLowerCase()}
							/>

							<p class="text-base">{s.setting.label}</p>
						</div>
					{/each}
				</div>
			{/if}
		{:catch error}
			<p class="text-red-500">{error}</p>
		{/await}
	</div>
</div>
