<script lang="ts">
	import Header from '$components/Header.svelte';
	import InfiniteList from '$components/InfiniteList.svelte';
	import VideoThumbnail from '$components/videoCards/VideoThumbnailMain.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Button, Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	const count = 12;

	let page = 0;
	let total: number;
	let videos: Video[] = [];
	let videoPromise: Promise<{ videos: Video[] }> | null = null;

	const loadVideos = async () => {
		if (total && videos.length >= total) return;

		videoPromise = new Promise(async (resolve) => {
			const response = await API.get(`/videos?page=${page}&count=${count}`);
			const data: { videos: Video[]; total: number } = await response.json();
			total = data.total;
			videos = [...videos, ...data.videos];
			resolve(data);
		});
		page++;

		await videoPromise;
		videoPromise = null;
	};

	onMount(loadVideos);
</script>

<svelte:head>
	<title>Home - YAR</title>
</svelte:head>

<Header />

<div class="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-6 2xl:grid-cols-4">
	<InfiniteList items={videos} on:loadmore={loadVideos} let:item>
		<Button class="h-fit w-full p-0" variant="ghost" href="/watch/{item.id}">
			<VideoThumbnail video={item} />
		</Button>
	</InfiniteList>

	{#await videoPromise}
		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
		{#each { length: Math.min(count, (total ?? 100) - count * Math.max(page, 1)) } as _}
			<div class="flex flex-col gap-2">
				<Skeleton class="aspect-video w-full" />
				<Skeleton class="h-8 w-full" />
			</div>
		{/each}
		<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
	{:then _}
		{#if videos.length === 0}
			<div class="col-span-full grid h-48 place-items-center">
				<div class="flex items-center justify-center text-red-500">
					<p>No videos found</p>
				</div>
			</div>
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
