<script lang="ts">
	import { page } from '$app/stores';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { onMount } from 'svelte';

	let sourcePromise: Promise<string>;

	onMount(() => {
		const { id: videoId } = $page.params;

		sourcePromise = new Promise<string>(async (resolve, reject) => {
			const response = await API.get('/videos/' + videoId);
			const data: Video = await response.json();
			console.log(data);

			return resolve(data.media.url!);
		});
	});
</script>

{#await sourcePromise}
	<p>Loading...</p>
{:then value}
	<video src={value} controls>
		<track kind="captions" />
	</video>
{:catch error}
	{error}
{/await}
