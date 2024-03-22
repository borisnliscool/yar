<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import VideoThumbnailSearch from '$components/videoCarts/VideoThumbnailSearch.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	let videosPromise: Promise<Video[]>;

	const loadVideos = (searchQuery: string) => {
		videosPromise = new Promise<Video[]>(async (resolve) => {
			const response = await API.get('/videos/search?query=' + encodeURIComponent(searchQuery));
			const data: { videos: Video[] } = await response.json();
			return resolve(data.videos);
		});
	};

	$: loadVideos($page.params.query);
	onMount(() => loadVideos($page.params.query));
</script>

<Header />

<div class="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6 xl:p-10">
	{#await videosPromise}
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
		{#if videos && videos.length > 0}
			{#each videos as video}
				<a href="/watch/{video.id}">
					<VideoThumbnailSearch {video} />
				</a>
			{/each}
		{:else}
			<div class="grid h-48 place-items-center">
				<div class="flex items-center justify-center text-red-500">
					<p>No results found for &quot;{$page.params.query}&quot;</p>
				</div>
			</div>
		{/if}
	{:catch error}
		<p class="text-red-500">{error}</p>
	{/await}
</div>
