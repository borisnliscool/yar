<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$components/Header.svelte';
	import { notifications } from '$components/notifications';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import { SettingsKey, UserRole, type Setting, type StatsResponse, type User } from '@repo/types';
	import { Button, Checkbox, Input, Skeleton, Tooltip } from '@repo/ui';
	import { filesize } from 'filesize';
	import prettyMilliseconds from 'pretty-ms';
	import { onMount } from 'svelte';

	let settingsPromise: Promise<Record<SettingsKey, Setting>> | undefined;
	let settings: { key: SettingsKey; setting: Setting }[];
	let loaded = false;

	let usersPromise: Promise<User[]> | undefined;
	let users: User[] = [];

	let statsPromise: Promise<StatsResponse> | undefined;

	const load = async () => {
		await API.get('/users/me')
			.then((r) => r.json())
			.then((user: User) => {
				if (!user.roles.includes(UserRole.ADMIN)) goto('/');
			})
			.catch(() => goto('/'));

		settingsPromise = API.get('/settings').then((r) => r.json());
		settingsPromise.then((data) => {
			settings = Object.entries(data).map(([key, setting]) => ({
				key: key as SettingsKey,
				setting: setting as Setting
			}));
		});

		usersPromise = API.get('/users').then((r) => r.json());
		usersPromise.then((data) => (users = data));

		statsPromise = API.get('/stats').then((r) => r.json());
	};

	onMount(load);

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

	const deleteUser = async (user: User) => {
		if (!confirm('Are you sure you want to delete this user?')) {
			return;
		}

		try {
			await API.delete('/users/' + user.id);
			users = users.filter((u) => u.id !== user.id);
			notifications.success('User deleted');
		} catch (err) {
			console.error(err);
			notifications.error('Failed to delete user');
		}
	};
</script>

<svelte:head>
	<title>Instance Settings - YAR</title>
</svelte:head>

<Header />

<div class="grid place-items-center">
	<div class="flex w-full max-w-2xl flex-col items-center gap-16 px-4 py-16 sm:px-0">
		<div class="flex w-full flex-col gap-4">
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

								<p class="text-sm">{s.setting.label}</p>
							</div>
						{/each}
					</div>
				{/if}
			{:catch error}
				<p class="text-red-500">{error}</p>
			{/await}
		</div>

		<div class="flex w-full flex-col gap-4">
			<p class="w-full">Instance Statistics</p>

			{#await statsPromise}
				<Skeleton class="h-8 w-full max-w-lg" />
				<Skeleton class="h-8 w-full max-w-lg" />
				<Skeleton class="h-8 w-full max-w-lg" />
			{:then value}
				{#if value}
					<div class="grid gap-2 md:grid-cols-2">
						<div>
							<p class="pb-1 text-sm">Storage usage:</p>

							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Total: {filesize(value.storage.total)}
							</p>
							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Videos: {filesize(value.storage.videos)}
							</p>
							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Images: {filesize(value.storage.images)}
							</p>
						</div>

						<div>
							<p class="pb-1 text-sm">Uploads:</p>

							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Count: {value.videos.total}
							</p>
							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Total duration: {prettyMilliseconds(value.videos.totalDuration * 1000)}
							</p>
							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Average duration: {prettyMilliseconds(value.videos.averageDuration * 1000)}
							</p>
						</div>
					</div>
				{/if}
			{:catch error}
				<p class="text-red-500">{error}</p>
			{/await}
		</div>

		<div class="flex w-full flex-col gap-4">
			<p class="w-full">Users</p>

			{#await usersPromise}
				<Skeleton class="h-10 w-full max-w-lg" />
				<Skeleton class="h-10 w-full max-w-lg" />
				<Skeleton class="h-10 w-full max-w-lg" />
			{:then _}
				{#if users}
					<div class="w-full rounded-md border border-neutral-100 text-sm dark:border-neutral-800">
						<div class="grid grid-cols-7 bg-neutral-100 px-4 py-2 dark:bg-neutral-800">
							<p class="col-span-2">Name</p>
							<p class="col-span-3">Roles</p>
							<p class="col-span-1">Created at</p>
						</div>

						{#each users as user}
							<div
								class="group grid grid-cols-7 place-items-center px-4 py-1 text-neutral-900 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800/50"
							>
								<p class="col-span-2 w-full">{user.username}</p>
								<p class="col-span-3 w-full">
									{user.roles.map((r) => r.replace('ROLE_', '').toLowerCase()).join(', ')}
								</p>
								<p class="col-span-1 w-full">
									<span class="h-full py-1">{new Date(user.created_at).toLocaleDateString()}</span>
									<Tooltip class="text-xs">
										{new Date(user.created_at).toISOString()}
									</Tooltip>
								</p>
								<div
									class="col-span-1 flex w-full items-center justify-end opacity-0 group-hover:opacity-100"
								>
									<div class="h-full py-1">
										<Button
											variant="destructive"
											class="h-fit rounded-sm px-1 py-0.5 text-xs"
											size="sm"
											disabled={$userStore.id === user.id}
											on:click={() => deleteUser(user)}
										>
											Delete
										</Button>
									</div>

									{#if $userStore.id === user.id}
										<Tooltip class="text-xs">You can't delete yourself</Tooltip>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{:catch error}
				<p class="text-red-500">{error}</p>
			{/await}
		</div>
	</div>
</div>
