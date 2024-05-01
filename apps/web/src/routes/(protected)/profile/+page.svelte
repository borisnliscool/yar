<script lang="ts">
	import Header from '$components/Header.svelte';
	import { notifications } from '$components/notifications';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import type { User } from '@repo/types';
	import { Button, Input, Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	let user: User | undefined;
	let userPromise: Promise<User>;
	let isBusy = false;

	const loadUser = () => {
		userPromise = (async () => {
			try {
				const response = await API.get('/users/me');
				user = (await response.json()) as User;
				userStore.set(user);
				return user;
			} catch (error) {
				notifications.error('Failed to load user');
				throw error;
			}
		})();
		return userPromise;
	};

	const save = async () => {
		isBusy = true;
		try {
			await API.put('/users/me', {
				username: user?.username
			});
			notifications.success('User saved');

			await loadUser();
		} catch (error) {
			notifications.error('Failed to save user');
			throw error;
		} finally {
			isBusy = false;
		}
	};

	onMount(loadUser);
</script>

<svelte:head>
	<title>Update Profile - YAR</title>
</svelte:head>

<Header />

<div class="grid place-items-center">
	<div class="flex w-full flex-col items-center gap-4 py-8">
		{#key userPromise}
			{#await userPromise}
				<Skeleton class="h-10 w-full max-w-lg" />
			{:then _}
				{#if user}
					<div class="flex w-full max-w-lg flex-col gap-4">
						<Input bind:value={user.username} placeholder="Username" />
					</div>

					<div class="sticky bottom-0 w-full">
						<div
							class="grid place-items-center bg-white/25 py-2 backdrop-blur-md dark:bg-neutral-900/25"
						>
							<div class="flex w-full max-w-lg items-center justify-end gap-2">
								<Button class="w-fit px-6 py-1.5" disabled={isBusy} on:click={save}>Save</Button>
							</div>
						</div>
					</div>
				{/if}
			{:catch error}
				<p class="text-red-500">{error}</p>
			{/await}
		{/key}
	</div>
</div>
