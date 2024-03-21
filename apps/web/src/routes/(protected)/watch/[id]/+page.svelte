<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';
	import VideoSidebar from './VideoSidebar.svelte';

	let videoPromise: Promise<Video>;

	const loadVideo = (videoId: string) => {
		videoPromise = new Promise<Video>(async (resolve) => {
			const response = await API.get('/videos/' + videoId);
			const data: Video = await response.json();
			return resolve(data);
		});
	};

	$: loadVideo($page.params.id);

	onMount(() => {
		const { id: videoId } = $page.params;
		loadVideo(videoId);
	});
</script>

<Header />

<div class="mx-auto grid w-full grid-cols-3 gap-4 overflow-hidden xl:grid-cols-7 xl:gap-4 xl:p-6">
	<div class="col-span-5 grid place-items-center">
		{#await videoPromise}
			<Skeleton class="aspect-video w-full" />
		{:then video}
			{#if video}
				<div class="flex w-full flex-col gap-8">
					<!-- svelte-ignore a11y-media-has-caption -->
					<video
						src={video.media.url}
						controls
						class="aspect-video h-full w-full bg-black object-contain shadow xl:rounded-lg"
					/>

					<h1 class="w-full text-2xl font-semibold">{video.title}</h1>
					<p></p>
				</div>
			{:else}
				<p>Video not found</p>
			{/if}
		{:catch error}
			<p class="text-red-500">{error}</p>
		{/await}
	</div>

	<div class="col-span-full h-full min-h-48 xl:col-span-2">
		<VideoSidebar />
	</div>
</div>
