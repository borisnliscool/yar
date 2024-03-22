<script lang="ts">
	import Header from '$components/Header.svelte';
	import VideoThumbnail from '$components/videoCarts/VideoThumbnailMain.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Button, Skeleton } from '@repo/ui';
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
			<Skeleton class="aspect-video w-full" />
		{/each}
	{:then response}
		{#if response}
			{#each response.videos as video}
				<Button class="h-fit w-full p-0" variant="ghost" href="/watch/{video.id}">
					<VideoThumbnail {video} />
				</Button>
			{/each}

			{#if response.videos.length === 0}
				<div class="col-span-full grid h-48 place-items-center">
					<div class="flex items-center justify-center text-red-500">
						<p>No videos found</p>
					</div>
				</div>
			{/if}
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
