<script lang="ts">
	import { goto } from '$app/navigation';
	import { notifications } from '$components/notifications';
	import API from '$lib/api';
	import { SettingsKey } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { onMount } from 'svelte';

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
			notifications.error('Failed to register');
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

	onMount(loadRegistrationEnabled);
</script>

<svelte:head>
	<title>Register - YAR</title>
</svelte:head>

<div
	class="relative z-0 flex h-screen w-full flex-col items-center justify-center gap-4 bg-black px-4 sm:p-0 dark:text-white"
>
	<div class="absolute -z-10 h-full w-full">
		<enhanced:img
			class="h-full w-full object-cover blur-lg"
			src="../../../static/img/login-background.webp?brightness=0.75"
			alt="login background"
		/>
	</div>

	<form
		on:submit|preventDefault|stopPropagation={register}
		class="z-10 mx-auto flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white/95 px-6 py-8 shadow-xl backdrop-blur-md sm:p-8 dark:bg-neutral-800/95"
	>
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
					class="dark:border-neutral-700"
					placeholder="password"
					name="password"
					type="password"
					bind:value={formData.password}
				/>
			</div>

			<Button type="submit" disabled={!formData.username || !formData.password}>
				Create account
			</Button>
		</div>

		<p class="flex items-center justify-center gap-1 text-xs">
			Already have an account?
			<Button size="none" variant="link" on:click={() => goto('/login')}>Login</Button>
		</p>
	</form>
</div>
