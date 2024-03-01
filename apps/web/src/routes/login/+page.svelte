<script lang="ts">
	import { goto } from '$app/navigation';
	import API from '$lib/api';
	import { Button, Input } from '@repo/ui';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;

	onMount(() => {
		if (form?.accessToken) {
			API.authorizationToken = form.accessToken;
			goto('/');
		}
	});
</script>

<div
	class="grid h-screen w-full place-items-center bg-neutral-50 dark:bg-neutral-900 dark:text-white"
>
	<form
		method="post"
		action="?/login"
		class="mx-auto flex w-full max-w-sm flex-col gap-6 rounded bg-white p-8 shadow dark:bg-neutral-800"
	>
		<h1 class="text-center text-xl font-semibold">Please login</h1>

		<div class="flex flex-col gap-2">
			<Input placeholder="username" name="username" />
			<Input placeholder="password" name="password" type="password" />
		</div>

		<Button type="submit">Login</Button>
	</form>
</div>
