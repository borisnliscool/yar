<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import InfiniteList from '$components/InfiniteList.svelte';
	import VideoThumbnailSearch from '$components/videoCards/VideoThumbnailSearch.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Button, Skeleton } from '@repo/ui';

	let videos: Video[] = [];
	let videosPromise: Promise<Video[]> | null = null;
	let searchPage = 0;
	let total = 0;
	let lastSearch = '';

	const loadVideos = async (searchQuery: string) => {
		if (lastSearch !== searchQuery) {
			videos = [];
			searchPage = 0;
			total = 0;
			lastSearch = searchQuery;
		}

		if (total && videos.length >= total) return;

		//eslint-disable-next-line no-async-promise-executor
		videosPromise = new Promise<Video[]>(async (resolve) => {
			const response = await API.get('/videos/search', {
				params: {
					query: encodeURIComponent(searchQuery),
					page: String(searchPage)
				}
			});
			const data: { videos: Video[]; total: number } = await response.json();
			videos = [...videos, ...data.videos];
			total = data.total;
			resolve(data.videos);
		});

		searchPage++;
		await videosPromise;
		videosPromise = null;
	};

	$: loadVideos($page.params.query);
</script>

<svelte:head>
	<title>Results for "{$page.params.query}"</title>
</svelte:head>

<Header searchQuery={lastSearch} />

<div class="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6 xl:p-10">
	<InfiniteList items={videos} on:loadmore={() => loadVideos($page.params.query)} let:item>
		<Button class="h-fit w-full p-0" variant="ghost" href="/watch/{item.id}">
			<VideoThumbnailSearch video={item} />
		</Button>
	</InfiniteList>

	{#await videosPromise}
		{#each Array(6) as id (id)}
			<div class="grid grid-cols-7 gap-4">
				<Skeleton class="col-span-3 aspect-video h-full" />

				<div class="col-span-4 flex flex-col gap-1">
					<Skeleton class="mb-1 h-6 w-full" />
					<Skeleton class="h-3 w-3/4" />
				</div>
			</div>
		{/each}
		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
	{:then _}
		{#if !videos.length}
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
