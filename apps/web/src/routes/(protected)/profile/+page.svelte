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

	let passwordUpdate = {
		oldPassword: '',
		newPassword: ''
	};

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
			const data: Record<string, string | undefined> = {
				username: user?.username
			};

			if (passwordUpdate.oldPassword && passwordUpdate.newPassword) {
				data.oldPassword = passwordUpdate.oldPassword;
				data.newPassword = passwordUpdate.newPassword;
			}

			await API.put('/users/me', data);
			notifications.success('User saved');

			passwordUpdate.oldPassword = '';
			passwordUpdate.newPassword = '';

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
				<Skeleton class="h-10 w-full max-w-lg" />
				<Skeleton class="h-10 w-full max-w-lg" />
			{:then _}
				{#if user}
					<div class="flex w-full max-w-lg flex-col gap-4">
						<div class="flex flex-col gap-2">
							<p>User details</p>

							<Input bind:value={user.username} placeholder="Username" />
						</div>

						<div class="flex flex-col gap-2">
							<p>Change Password</p>

							<Input
								bind:value={passwordUpdate.oldPassword}
								type="password"
								placeholder="Old password"
							/>

							<Input
								bind:value={passwordUpdate.newPassword}
								type="password"
								placeholder="New password"
							/>
						</div>
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
