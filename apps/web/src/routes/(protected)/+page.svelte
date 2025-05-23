<script lang="ts">
	import Header from '$components/Header.svelte';
	import InfiniteList from '$components/InfiniteList.svelte';
	import Motd from '$components/Motd.svelte';
	import VideoThumbnailMain from '$components/videoCards/VideoThumbnailMain.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Button, Repeat, Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';

	const count = 12;

	let page = 0;
	let seed = Math.random();

	let totalVideoCount: number;
	let videos: Video[] = [];
	let videoPromise: Promise<{ videos: Video[] }> | null = null;

	const loadVideos = async () => {
		if (
			totalVideoCount &&
			(videos.length >= totalVideoCount || Math.ceil(totalVideoCount / count) <= page)
		)
			return;

		//eslint-disable-next-line no-async-promise-executor
		videoPromise = new Promise(async (resolve) => {
			const response = await API.get(`/videos`, {
				params: {
					page: String(page),
					count: String(count),
					seed: String(seed)
				}
			});
			const data: { videos: Video[]; total: number } = await response.json();
			totalVideoCount = data.total;

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
	<title>Home</title>
</svelte:head>

<Header />
<Motd />

<div class="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4 2xl:grid-cols-4">
	<InfiniteList items={videos} on:loadmore={loadVideos} let:item>
		<Button class="h-fit w-full p-0" variant="ghost" href="/watch/{item.id}">
			<VideoThumbnailMain video={item} />
		</Button>
	</InfiniteList>

	{#await videoPromise}
		{#each Repeat(Math.min(count, (totalVideoCount ?? 100) - count * Math.max(page, 1))) as id (id)}
			<div class="flex flex-col gap-2">
				<Skeleton class="aspect-video w-full" />
			</div>
			<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
		{/each}
	{:then _}
		{#if !videos.length}
			<div class="col-span-full grid h-48 place-items-center">
				<div class="flex items-center justify-center text-red-500">
					<p>No videos found, upload some!</p>
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
