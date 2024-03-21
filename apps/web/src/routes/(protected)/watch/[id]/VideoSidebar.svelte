<script lang="ts">
	import VideoThumbnailSidebar from '$components/VideoThumbnailSidebar.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	export let hiddenVideos: Video[];

	let videosPromise: Promise<Video[]>;

	onMount(() => {
		videosPromise = new Promise<Video[]>(async (resolve) => {
			const response = await API.get('/videos?random=1');
			const data: { videos: Video[] } = await response.json();

			return resolve(
				data.videos.filter((video) => hiddenVideos.findIndex((v) => v?.id === video.id) === -1)
			);
		});
	});
</script>

<div class="flex w-full flex-col gap-2 p-2 xl:p-0">
	{#await videosPromise}
		{#each Array(5) as _}
			<div class="grid grid-cols-7 gap-4">
				<Skeleton class="col-span-3 aspect-video h-full" />

				<div class="col-span-4 flex flex-col gap-1">
					<Skeleton class="mb-1 h-6 w-full" />
					<Skeleton class="h-3 w-3/4" />
				</div>
			</div>
		{/each}
	{:then videos}
		{#if videos}
			{#each videos as video}
				<a href="/watch/{video.id}">
					<VideoThumbnailSidebar {video} />
				</a>
			{/each}
		{/if}
	{:catch error}
		<p class="text-red-500">{error}</p>
	{/await}
</div>
