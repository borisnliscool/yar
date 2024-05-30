<script lang="ts">
	import { goto } from '$app/navigation';
	import { notifications } from '$components/notifications';
	import API, { HttpError } from '$lib/api';
	import { SettingsKey } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { onMount } from 'svelte';

	let MIN_PASSWORD_LENGTH = 0;

	const formData = {
		username: '',
		password: ''
	};

	const register = async () => {
		try {
			const response = await API.post('/auth/register', formData, {
				noAuth: true
			});

			const data: { accessToken: string } = await response.json();
			API.authorizationToken = data.accessToken;

			notifications.success('Registered successfully');
			await goto('/');
		} catch (err) {
			if (err instanceof HttpError) {
				notifications.error(`Failed to register: ${err.message}`);
			}
			console.error(err);
		}
	};

	const loadRegistrationEnabled = async () => {
		const response = await API.get('settings/' + SettingsKey.ENABLE_REGISTRATION, {
			noAuth: true
		});

		const data = await response.json();
		if (!data[SettingsKey.ENABLE_REGISTRATION] as boolean) {
			notifications.error('Registration is not enabled');
			await goto('/login');
		}
	};

	const loadMinPasswordStrength = async () => {
		const response = await API.get('settings/' + SettingsKey.MIN_PASSWORD_LENGTH, {
			noAuth: true
		});

		const data = await response.json();
		MIN_PASSWORD_LENGTH = data[SettingsKey.MIN_PASSWORD_LENGTH] as number;
	};

	onMount(() => Promise.all([loadRegistrationEnabled(), loadMinPasswordStrength()]));
</script>

<svelte:head>
	<title>Register - YAR</title>
</svelte:head>

<form on:submit|preventDefault|stopPropagation={register} class="flex w-full flex-col gap-4">
	<div class="flex flex-col gap-6">
		<h1 class="pb-2 text-center text-xl font-semibold">Register</h1>

		<div class=" flex flex-col gap-2">
			<Input
				class="dark:border-neutral-700"
				placeholder="username"
				name="username"
				bind:value={formData.username}
			/>

			<Input
				class="dark:border-neutral-700 {formData.password &&
				formData.password.length < MIN_PASSWORD_LENGTH
					? '!border-red-500 !ring-red-500/50'
					: ''}"
				placeholder="password"
				name="password"
				type="password"
				bind:value={formData.password}
			/>

			{#if formData.password && formData.password.length < MIN_PASSWORD_LENGTH}
				<p class="text-xs text-red-500">This password is too weak</p>
			{/if}
		</div>

		<Button
			type="submit"
			disabled={!formData.username ||
				!formData.password ||
				formData.password.length < MIN_PASSWORD_LENGTH}
		>
			Create account
		</Button>
	</div>

	<p class="flex items-center justify-center gap-1 text-xs">
		Already have an account?
		<Button size="none" variant="link" on:click={() => goto('/login')}>Login</Button>
	</p>
</form>
