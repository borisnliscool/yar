<script lang="ts">
	import { goto } from '$app/navigation';
	import API from '$lib/api';
	import { onMount } from 'svelte';

	onMount(async () => {
		try {
			await API.post('/auth/logout');
			API.authorizationToken = undefined;
		} finally {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Logout</title>
</svelte:head>

<div class="grid h-screen w-full place-items-center">
	<p>
		Logging you out, if you are not redirected please click <a
			href="/login"
			class="text-primary-500">here</a
		>.
	</p>
</div>
