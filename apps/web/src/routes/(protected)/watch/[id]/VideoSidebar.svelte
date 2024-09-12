<script lang="ts">
	import VideoThumbnailMain from '$components/videoCards/VideoThumbnailMain.svelte';
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

{#await videosPromise}
	<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
	{#each Array(6) as _}
		<Skeleton class="aspect-video w-full" />
	{/each}
{:then videos}
	{#if videos}
		{#each videos as video}
			<a href="/watch/{video.id}">
				<VideoThumbnailMain {video} />
			</a>
		{/each}
	{/if}
{:catch error}
	<p class="text-red-500">{error}</p>
{/await}
