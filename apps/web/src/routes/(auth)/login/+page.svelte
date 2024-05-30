<script lang="ts">
	import { goto } from '$app/navigation';
	import { notifications } from '$components/notifications';
	import API, { HttpError } from '$lib/api';
	import { ErrorType, SettingsKey } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { onMount } from 'svelte';

	let registrationEnabled = false;
	let showTotpField = false;
	let loading = false;

	const formData = {
		username: '',
		password: '',
		totp_code: ''
	};

	const login = async () => {
		loading = true;

		try {
			const response = await API.post('/auth/login', formData, {
				noAuth: true
			});

			const data: { accessToken: string } = await response.json();
			API.authorizationToken = data.accessToken;

			await goto('/');
		} catch (error) {
			if (!(error instanceof HttpError)) {
				throw error;
			}

			if (error.type === ErrorType.TOTP_REQUIRED) {
				showTotpField = true;
				return;
			}

			if (error.type === ErrorType.TOTP_INVALID) {
				notifications.error('Invalid TOTP code');
				formData.totp_code = '';
				showTotpField = true;
				return;
			}

			showTotpField = false;
			notifications.error(`Failed to login: ${error.message}`);
			console.error(error);
		} finally {
			loading = false;
		}
	};

	const loadRegistrationEnabled = async () => {
		const response = await API.get('settings/' + SettingsKey.ENABLE_REGISTRATION, {
			noAuth: true
		});

		const data = await response.json();
		registrationEnabled = data[SettingsKey.ENABLE_REGISTRATION] as boolean;
	};

	onMount(loadRegistrationEnabled);
</script>

<svelte:head>
	<title>Login - YAR</title>
</svelte:head>

<form on:submit|preventDefault|stopPropagation={login} class="flex w-full flex-col gap-4">
	<div class="flex flex-col gap-6">
		<h1 class="pb-2 text-center text-xl font-semibold">Please log in</h1>

		<div class=" flex flex-col gap-2">
			{#if !showTotpField}
				<Input
					class="dark:border-neutral-700"
					placeholder="username"
					name="username"
					bind:value={formData.username}
				/>
				<Input
					class="dark:border-neutral-700"
					placeholder="password"
					name="password"
					type="password"
					bind:value={formData.password}
				/>
			{:else}
				<Input
					class="text-center dark:border-neutral-700"
					placeholder="2FA code"
					name="totp"
					bind:value={formData.totp_code}
				/>
			{/if}
		</div>

		<Button type="submit" disabled={!formData.username || !formData.password || loading}>
			Login
		</Button>
	</div>

	{#if registrationEnabled}
		<p class="flex items-center justify-center gap-1 text-xs">
			Don't have an account yet?
			<Button size="none" variant="link" on:click={() => goto('/register')}>Register</Button>
		</p>
	{/if}
</form>
