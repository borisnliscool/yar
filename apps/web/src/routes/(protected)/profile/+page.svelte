<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$components/Header.svelte';
	import { modals } from '$components/modalService';
	import { notifications } from '$components/notifications';
	import API, { HttpError } from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import Icon from '@iconify/svelte';
	import { DeviceType, type SessionDisplay, type User } from '@repo/types';
	import { Button, Input, Modal, Skeleton, Tooltip } from '@repo/ui';
	import { randomstring } from '@repo/utils';
	import { onMount } from 'svelte';
	//@ts-ignore svelte-qrcode is not typed, so we have to do this
	import QrCode from 'svelte-qrcode';

	let user: User | undefined;
	let userPromise: Promise<User>;
	let isBusy = false;

	let passwordUpdate = {
		oldPassword: '',
		newPassword: ''
	};

	let sessionsPromise: Promise<SessionDisplay[]>;
	let showEnableTotp = false;

	let newTotpSecret: string | undefined;
	let newTotpQrCode: string | undefined;
	let newTotpVerification: string | undefined;
	let savingNewTotp = false;

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
		modals.create('revoke-session', {
			title: 'Revoke Session',
			contents: 'Are you sure you want to revoke this session?',
			buttons: [
				{
					label: 'Cancel',
					variant: 'outline'
				},
				{
					label: 'Revoke Session',
					variant: 'destructive',
					onClick: async (hide) => {
						try {
							await API.delete('/sessions/' + sessionId);
							await loadSessions();
							notifications.success('Session revoked');
							hide();
						} catch (error) {
							notifications.error('Failed to revoke session');
							throw error;
						}
					}
				}
			]
		});
	};

	const revokeAllSessions = async () => {
		modals.create('revoke-all-sessions', {
			title: 'Revoke All Sessions',
			contents:
				'Are you sure you want to revoke all sessions? This will also revoke your current session and log you out.',
			buttons: [
				{
					label: 'Cancel',
					variant: 'outline'
				},
				{
					label: 'Revoke All Sessions',
					variant: 'destructive',
					onClick: async (hide) => {
						try {
							await API.delete('/sessions');
							hide();
							await goto('/logout');
						} catch (error) {
							notifications.error('Failed to revoke sessions');
							throw error;
						}
					}
				}
			]
		});
	};

	const disableTotp = async () => {
		modals.create('disable-totp', {
			title: 'Disable 2FA',
			contents:
				'Are you sure you want to disable 2FA authentication? This will weaken your account security, and is strongly advised against. You can re-enable 2FA at any time.',
			buttons: [
				{
					label: 'Cancel',
					variant: 'outline'
				},
				{
					label: 'Disable 2FA',
					variant: 'destructive',
					onClick: async (hide) => {
						try {
							await API.delete('/auth/totp');
							user!.totp_enabled = false;
							notifications.success('2FA disabled');
							hide();
						} catch (error) {
							notifications.error('Failed to disable 2FA');
							throw error;
						}
					}
				}
			]
		});
	};

	const enableTotp = async () => {
		showEnableTotp = true;
		newTotpSecret = randomstring(16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
		newTotpQrCode = `otpauth://totp/YAR - ${location.hostname}:${user?.username}?secret=${newTotpSecret}&issuer=YAR`;
	};

	const saveTotp = async (cb: () => void) => {
		savingNewTotp = true;

		try {
			await API.post('/auth/totp', {
				secret: newTotpSecret,
				verify_code: newTotpVerification
			});

			user!.totp_enabled = true;
			notifications.success('2FA enabled');

			cb();
		} catch (error) {
			if (error instanceof HttpError) {
				notifications.error('Failed to enable 2FA: ' + error.message);
			}
			throw error;
		}

		savingNewTotp = false;
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
					<div class="flex w-full max-w-lg flex-col gap-6">
						<div class="flex flex-col gap-2">
							<p>User details</p>

							<p class="text-xs text-neutral-700 dark:text-neutral-400">
								Changing your username will also change the credentials you log in with.
							</p>

							<Input
								bind:value={user.username}
								placeholder="Username"
								class="dark:border-neutral-700"
							/>
						</div>

						<div class="flex flex-col gap-2">
							<p>Change password</p>

							<Input
								bind:value={passwordUpdate.oldPassword}
								type="password"
								placeholder="Old password"
								class="dark:border-neutral-700"
							/>

							<Input
								bind:value={passwordUpdate.newPassword}
								type="password"
								placeholder="New password"
								class="dark:border-neutral-700"
							/>
						</div>

						<div class="flex w-full items-center justify-end gap-2">
							<Button
								class="w-fit px-4 py-1"
								variant="success"
								disabled={isBusy}
								size="sm"
								on:click={save}
							>
								Save Changes
							</Button>
						</div>
					</div>
				{/if}
			{:catch error}
				<p class="text-red-500">{error}</p>
			{/await}
		{/key}
	</div>

	<div class="flex w-full max-w-lg flex-col gap-4">
		{#key userPromise}
			{#await userPromise}
				<Skeleton class="h-10 w-full max-w-lg" />
				<Skeleton class="h-10 w-full max-w-lg" />
				<Skeleton class="h-10 w-full max-w-lg" />

				<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
			{:then _}
				{#if user}
					<div class="flex w-full max-w-lg flex-col gap-6">
						<div class="flex flex-col gap-2">
							<p>2FA authentication</p>

							{#if user?.totp_enabled}
								<p class="text-xs text-neutral-700 dark:text-neutral-400">
									TOTP authentication is enabled.
								</p>

								<Button
									size="sm"
									class="h-fit w-fit px-2 py-1.5"
									variant="destructive"
									on:click={disableTotp}
								>
									Disable
								</Button>
							{:else}
								<p class="text-xs text-neutral-700 dark:text-neutral-400">
									TOTP authentication is disabled, it is recommended to enable it for extra
									security.
								</p>

								<Button size="sm" on:click={enableTotp} class="h-fit w-fit px-2 py-1.5">
									Set up
								</Button>
							{/if}
						</div>
					</div>
				{/if}
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

<Modal title="Set up 2FA" bind:shown={showEnableTotp}>
	<p class="text-sm text-neutral-700 dark:text-neutral-400">
		Scan the QR code below with your preferred 2FA app, then enter the code below to finish setting
		up 2FA.
	</p>

	<div class="mx-auto w-fit rounded bg-white p-4">
		<QrCode value={newTotpQrCode} />
	</div>

	<p class="text-center text-xs text-neutral-700 dark:text-neutral-400">
		Or, use this secret: <span class="rounded-sm bg-neutral-100 p-1 font-mono dark:bg-neutral-800"
			>{newTotpSecret}</span
		>
	</p>

	<Input
		bind:value={newTotpVerification}
		placeholder="Enter 6-digit code"
		class="mx-auto w-full max-w-48 text-center dark:border-neutral-700"
	/>

	<svelte:fragment slot="footer" let:hideModal>
		<hr class="border-t dark:border-neutral-800" />
		<div class="flex w-full items-center justify-end gap-2">
			<Button
				variant="outline"
				class="h-fit px-4 py-2 dark:border-neutral-700"
				size="sm"
				on:click={() => hideModal()}
			>
				Close
			</Button>

			<Button
				class="h-fit px-4 py-2"
				size="sm"
				disabled={savingNewTotp || newTotpVerification?.length !== 6}
				on:click={() => saveTotp(hideModal)}
			>
				Save
			</Button>
		</div>
	</svelte:fragment>
</Modal>
