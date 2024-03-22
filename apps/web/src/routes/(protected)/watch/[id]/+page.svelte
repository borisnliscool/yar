<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';
	import VideoSidebar from './VideoSidebar.svelte';

	let videoPromise: Promise<Video>;
	let loadedVideo: Video;

	const loadVideo = (videoId: string) => {
		videoPromise = new Promise<Video>(async (resolve) => {
			const response = await API.get('/videos/' + videoId);
			const data: Video = await response.json();
			loadedVideo = data;
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
				<div class="flex w-full flex-col xl:gap-4">
					<!-- svelte-ignore a11y-media-has-caption -->
					<video
						src={video.media.url}
						controls
						autoplay
						class="aspect-video h-full w-full bg-black object-contain shadow xl:rounded-lg"
					/>

					<div class="flex flex-col gap-4 p-4 xl:p-0">
						<h1 class="w-full text-2xl font-semibold">{video.title}</h1>
						{#if video.description}
							<p>{video.description}</p>
						{/if}
					</div>
				</div>
			{:else}
				<p>Video not found</p>
			{/if}
		{:catch error}
			<p class="text-red-500">{error}</p>
		{/await}
	</div>

	{#key $page.params.id}
		<div class="col-span-full h-full xl:col-span-2">
			<VideoSidebar hiddenVideos={[loadedVideo]} />
		</div>
	{/key}
</div>
