<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$components/Header.svelte';
	import { notifications } from '$components/notifications';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import Icon from '@iconify/svelte';
	import { DeviceType, type SessionDisplay, type User } from '@repo/types';
	import { Button, Input, Skeleton, Tooltip } from '@repo/ui';
	import { onMount } from 'svelte';

	let user: User | undefined;
	let userPromise: Promise<User>;
	let isBusy = false;

	let passwordUpdate = {
		oldPassword: '',
		newPassword: ''
	};

	let sessionsPromise: Promise<SessionDisplay[]>;

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

	const loadSessions = async () => {
		sessionsPromise = API.get('/sessions').then((r) => r.json());
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

	const revokeSession = async (sessionId: string) => {
		if (!confirm('Are you sure you want to revoke this session?')) {
			return;
		}

		try {
			await API.delete('/sessions/' + sessionId);
			await loadSessions();
			notifications.success('Session revoked');
		} catch (error) {
			notifications.error('Failed to revoke session');
			throw error;
		}
	};

	const revokeAllSessions = async () => {
		if (
			!confirm(
				'Are you sure you want to revoke all sessions? This will also revoke your current session and log you out.'
			)
		) {
			return;
		}

		try {
			await API.delete('/sessions');
			notifications.success('Sessions revoked');
			await goto('/logout');
		} catch (error) {
			notifications.error('Failed to revoke sessions');
			throw error;
		}
	};

	onMount(() => {
		loadUser();
		loadSessions();
	});
</script>

<svelte:head>
	<title>Update Profile - YAR</title>
</svelte:head>

<Header />

<div class="flex flex-col items-center justify-center gap-16 py-16">
	<div class="flex w-full flex-col items-center gap-4">
		{#key userPromise}
			{#await userPromise}
				<Skeleton class="h-10 w-full max-w-lg" />
				<Skeleton class="h-10 w-full max-w-lg" />
				<Skeleton class="h-10 w-full max-w-lg" />

				<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
			{:then _}
				{#if user}
					<div class="flex w-full max-w-lg flex-col gap-4">
						<div class="flex flex-col gap-2">
							<p>User details</p>

							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Changing your username will also change the credentials you log in with.
							</p>

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
								<Button class="w-fit px-4 py-1" disabled={isBusy} size="sm" on:click={save}>
									Save
								</Button>
							</div>
						</div>
					</div>
				{/if}
			{:catch error}
				<p class="text-red-500">{error}</p>
			{/await}
		{/key}
	</div>

	<div class="flex w-full max-w-lg flex-col gap-4">
		{#await sessionsPromise}
			<Skeleton class="h-24 w-full max-w-lg" />
			<Skeleton class="h-24 w-full max-w-lg" />
			<Skeleton class="h-24 w-full max-w-lg" />
		{:then sessions}
			<div class="flex flex-col gap-1">
				<p>Sessions</p>
				<p class="text-xs text-neutral-700 dark:text-neutral-400">
					This is a list of devices that have logged into your account. Revoke any sessions that you
					do not recognize.
				</p>
			</div>

			<div class="flex flex-col gap-2">
				{#if sessions}
					{#each sessions as session}
						<div
							class="flex items-center gap-4 rounded-lg border py-3 pl-5 pr-4 dark:border-neutral-700"
						>
							<div
								class="grid size-10 place-items-center text-xl text-neutral-700 dark:text-neutral-400"
							>
								{#if session.device_type === DeviceType.DESKTOP}
									<Icon icon="fa6-solid:display" />
								{:else}
									<Icon icon="fa6-solid:mobile-screen" />
								{/if}
							</div>

							<div>
								<p class="flex items-center gap-2 text-sm font-medium">
									{session.device_name}
								</p>
								<p class="text-xs text-neutral-700 dark:text-neutral-400">
									{#if session.current}
										Your current session
									{:else}
										Last accessed on {new Intl.DateTimeFormat(undefined, {
											dateStyle: 'long',
											timeStyle: 'short'
										}).format(new Date(session.created_at))}
									{/if}
								</p>
							</div>

							<div class="ml-auto py-1">
								<Button
									variant="destructive"
									disabled={session.current}
									size="sm"
									on:click={() => revokeSession(session.id)}
								>
									Revoke
								</Button>
							</div>

							{#if session.current}
								<Tooltip class="text-xs">Cannot revoke current session</Tooltip>
							{/if}
						</div>
					{/each}
				{/if}
			</div>

			<Button
				class="mx-auto w-fit px-4"
				variant="destructive"
				size="sm"
				on:click={revokeAllSessions}
			>
				Revoke All Sessions
			</Button>
		{:catch error}
			<p class="text-red-500">{error}</p>
		{/await}
	</div>
</div>
