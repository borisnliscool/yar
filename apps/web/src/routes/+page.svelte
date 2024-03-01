<script lang="ts">
	import Header from '$components/Header.svelte';
	import API from '$lib/api';
	import VideoThumbnail from '$lib/components/VideoThumbnail.svelte';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	let videoPromise: Promise<{ videos: Video[] }>;

	onMount(async () => {
		videoPromise = new Promise(async (resolve) => {
			const response = await API.get('/videos');
			const data: { videos: Video[] } = await response.json();
			resolve(data);
		});
	});
</script>

<Header />

<div class="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
	{#await videoPromise}
		{#each Array(12) as _}
			<Skeleton class="aspect-video" />
		{/each}
	{:then response}
		{#if response}
			{#each response.videos as video}
				<VideoThumbnail {video} />
			{/each}
		{/if}
	{:catch error}
		<div class="col-span-full grid h-48 place-items-center">
			<div class="flex items-center justify-center text-red-500">
				<p>Failed to load videos:</p>
				<p>{error}</p>
			</div>
		</div>
	{/await}
</div>
