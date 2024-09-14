<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import Icon from '@iconify/svelte';
	import type { Video } from '@repo/types';
	import { Button, Skeleton } from '@repo/ui';
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
</script>

<svelte:head>
	<title>{loadedVideo ? loadedVideo.title : 'Loading...'}</title>
</svelte:head>

<Header />

<div class="mx-auto flex flex-col">
	<div class="grid w-full grid-cols-3 gap-4 overflow-hidden xl:grid-cols-7 xl:gap-6 xl:p-4">
		{#await videoPromise}
			<div class="col-span-full xl:col-span-5">
				<Skeleton class="aspect-video w-full" />
			</div>
			<div class="col-span-full xl:col-span-2">
				<Skeleton class="size-full" />
			</div>
		{:then video}
			<div class="col-span-full xl:col-span-5">
				{#if video}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video
						src={video.media.url}
						controls
						autoplay
						class="aspect-video w-full bg-black object-contain shadow xl:rounded-lg"
					/>
				{/if}
			</div>

			<div class="col-span-full xl:col-span-2">
				<div class="flex h-full flex-col gap-2 p-4 xl:p-0">
					<h1 class="flex w-full items-center justify-between text-2xl font-semibold">
						{video.title}

						{#if $userStore && video.author.id == $userStore.id}
							<Button variant="ghost" href="/editor/{video.id}">
								<Icon icon="fa6-solid:pen" />
							</Button>
						{/if}
					</h1>

					{#if video.tags.length}
						<div class="flex flex-wrap gap-1.5">
							{#each video.tags as tag}
								<div
									class="rounded-full border bg-neutral-50 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
								>
									{tag}
								</div>
							{/each}
						</div>
					{/if}

					<p>Author: {video.author.username}</p>

					{#if video.description}
						<div class="h-full overflow-y-auto">
							<p>Description:</p>
							<p class="text-neutral-600 dark:text-neutral-400">{video.description}</p>
						</div>
					{/if}
				</div>
			</div>
		{/await}
	</div>

	<div class="px-4 py-2">
		<hr class="dark:border-neutral-700" />
	</div>

	<div class="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3 lg:p-4 2xl:grid-cols-4">
		<VideoSidebar hiddenVideos={[loadedVideo]} />
	</div>
</div>
