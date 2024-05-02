<script lang="ts">
	import { goto } from '$app/navigation';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';

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

	onMount(getCurrentUser);
</script>

<slot />
