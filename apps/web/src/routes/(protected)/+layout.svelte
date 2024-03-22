<script lang="ts">
	import { goto } from '$app/navigation';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import { onMount } from 'svelte';

	const getCurrentUser = async () => {
		const response = await API.get('/users/me');
		if (!response.ok) return goto('/login');

		const data = await response.json();
		userStore.set(data);
	};

	onMount(getCurrentUser);
</script>

<slot />
