<script lang="ts">
	import { page } from '$app/stores';
	import API from '$lib/api';
	import { onMount } from 'svelte';

	let sourcePromise: Promise<string>;

	onMount(() => {
		const { id: videoId } = $page.params;

		sourcePromise = new Promise<string>(async (resolve, reject) => {
			const response = await API.get('/videos/' + videoId);
			console.log(response);
		});
	});
</script>
