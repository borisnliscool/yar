<script lang="ts">
	import VideoThumbnailSidebar from '$components/videoCards/VideoThumbnailSidebar.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	export let hiddenVideos: Video[];

	let videosPromise: Promise<Video[]>;

	onMount(() => {
		videosPromise = new Promise<Video[]>(async (resolve) => {
			const response = await API.get('/videos');
			const data: { videos: Video[] } = await response.json();
			return resolve(
				data.videos.filter((video) => hiddenVideos.findIndex((v) => v?.id === video.id) === -1)
			);
		});
	});
</script>

<div class="grid w-full grid-cols-1 gap-2 gap-x-6 p-2 lg:grid-cols-2 xl:grid-cols-1 xl:p-0">
	{#await videosPromise}
		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
		{#each Array(6) as _}
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
