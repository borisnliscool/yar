<script lang="ts">
	import { goto } from '$app/navigation';
	import API from '$lib/api';
	import { SettingsKey } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { onMount } from 'svelte';

	let registrationEnabled = false;

	const formData = {
		username: '',
		password: ''
	};

	const login = async () => {
		const response = await API.post('/auth/login', formData, {
			noAuth: true
		});

		const data: { accessToken: string } = await response.json();
		API.authorizationToken = data.accessToken;

		await goto('/');
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

<div
	class="relative z-0 flex h-screen w-full flex-col items-center justify-center gap-4 px-4 sm:p-0 dark:text-white"
>
	<div class="absolute -z-10 h-full w-full">
		<enhanced:img
			class="h-full w-full object-cover blur-lg"
			src="../../../static/img/login-background.webp?brightness=0.75"
			alt="login background"
		/>
	</div>

	<form
		on:submit|preventDefault|stopPropagation={login}
		class="z-10 mx-auto flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white/95 px-6 py-8 shadow-xl backdrop-blur-md sm:p-8 dark:bg-neutral-800/95"
	>
		<div class="flex flex-col gap-6">
			<h1 class="pb-2 text-center text-xl font-semibold">Please log in</h1>

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

			<Button type="submit">Login</Button>
		</div>

		<!-- {#if registrationEnabled}
			<p class="flex items-center justify-center gap-1 text-xs">
				Don't have an account yet?
				<Button size="none" variant="link" on:click={() => goto('/register')}>Register</Button>
			</p>
		{/if} -->
	</form>

	<footer class="absolute bottom-0 left-0 right-0 flex w-full justify-end p-2">
		<p class="flex gap-1 text-xs">
			Background by
			<Button
				size="none"
				variant="link"
				target="_blank"
				href="https://unsplash.com/@vackground?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
			>
				vackground.com
			</Button>
			on
			<Button
				size="none"
				variant="link"
				target="_blank"
				href="https://unsplash.com/photos/a-blue-and-pink-abstract-background-with-wavy-lines-agUC-v_D1iI?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
			>
				Unsplash
			</Button>
		</p>
	</footer>
</div>
