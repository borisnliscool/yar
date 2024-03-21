<script lang="ts">
	import VideoThumbnailSidebar from '$components/VideoThumbnailSidebar.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	let videosPromise: Promise<{ videos: Video[] }>;

	onMount(() => {
		videosPromise = API.get('/videos?random=1').then((response) => response.json());
	});
</script>

<div class="flex w-full flex-col gap-2 p-2 xl:p-0">
	{#await videosPromise}
		<div class="grid grid-cols-7 gap-4">
			<Skeleton class="col-span-3 aspect-video h-full" />

			<div class="col-span-4 flex flex-col gap-1">
				<Skeleton class="mb-1 h-6 w-full" />
				<Skeleton class="h-3 w-3/4" />
				<Skeleton class="h-3 w-5/6" />
				<Skeleton class="h-3 w-1/3" />
			</div>
		</div>
	{:then videos}
		{#if videos}
			{#each videos.videos as video}
				<a href="/watch/{video.id}">
					<VideoThumbnailSidebar {video} />
				</a>
			{/each}
		{/if}
	{:catch error}
		<!-- promise was rejected -->
	{/await}
</div>
