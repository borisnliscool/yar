<script lang="ts">
	import API from '$lib/api';
	import { Button, Input } from '@repo/ui';
	import { redirect } from '@sveltejs/kit';

	const formData = {
		username: '',
		password: ''
	};

	const submit = async () => {
		const response = await API.post('/auth/login', formData, { noAuth: true });
		if (!response.ok) return console.log('invalid creds');

		API.authorizationToken = await API.getAuthorizationToken();
		redirect(302, '/');
	};
</script>

<div
	class="grid h-screen w-full place-items-center bg-neutral-50 dark:bg-neutral-900 dark:text-white"
>
	<form
		on:submit|preventDefault|stopPropagation={submit}
		class="mx-auto flex w-full max-w-sm flex-col gap-6 rounded bg-white p-8 shadow dark:bg-neutral-800"
	>
		<h1 class="text-center text-xl font-semibold">Please login</h1>

		<div class="flex flex-col gap-2">
			<Input placeholder="username" bind:value={formData.username} />
			<Input placeholder="password" bind:value={formData.password} type="password" />
		</div>

		<Button type="submit">Login</Button>
	</form>
</div>
