<script lang="ts">
	import { goto } from '$app/navigation';
	import Spinner from '$components/Spinner.svelte';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let promise = Promise.resolve();

	const getCurrentUser = async () => {
		try {
			const response = await API.get('/users/me');
			if (!response.ok) throw new Error('failed to perform request');

			const data = await response.json();
			userStore.set(data);
		} catch (error) {
			return goto('/login');
		}
	};

	onMount(() => (promise = getCurrentUser()));
</script>

{#await promise}
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 z-50 grid h-screen w-screen place-items-center"
	>
		<Spinner size={32} />
	</div>
{:then _}
	<div transition:fade={{ duration: 150, delay: 150 }}>
		<slot />
	</div>
{/await}
