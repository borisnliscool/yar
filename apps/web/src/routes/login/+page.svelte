<script lang="ts">
	import { goto } from '$app/navigation';
	import API from '$lib/api';
	import { Button, Input } from '@repo/ui';

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
</script>

<div
	class="grid h-screen w-full place-items-center bg-neutral-50 dark:bg-neutral-900 dark:text-white"
>
	<form
		on:submit|preventDefault|stopPropagation={login}
		class="mx-auto flex w-full max-w-sm flex-col gap-6 rounded bg-white p-8 shadow dark:bg-neutral-800"
	>
		<h1 class="text-center text-xl font-semibold">Please login</h1>

		<div class="flex flex-col gap-2">
			<Input placeholder="username" name="username" bind:value={formData.username} />
			<Input
				placeholder="password"
				name="password"
				type="password"
				bind:value={formData.password}
			/>
		</div>

		<Button type="submit">Login</Button>
	</form>
</div>
