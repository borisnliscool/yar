<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';
	import VideoSidebar from './VideoSidebar.svelte';

	let sourcePromise: Promise<string>;

	onMount(() => {
		const { id: videoId } = $page.params;

		sourcePromise = new Promise<string>(async (resolve, reject) => {
			const response = await API.get('/videos/' + videoId);
			const data: Video = await response.json();
			return resolve(data.media.url!);
		});
	});
</script>

<Header />

<div class="mx-auto grid w-full grid-cols-3 gap-4 p-4 xl:grid-cols-7 xl:gap-8 xl:p-8">
	<div class="col-span-5 grid aspect-video place-items-center overflow-hidden rounded-lg shadow">
		{#await sourcePromise}
			<Skeleton class="h-full w-full" />
		{:then value}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video autoplay src={value} controls class="h-full w-full bg-black" />
		{:catch error}
			{error}
		{/await}
	</div>

	<div class="col-span-full h-full min-h-48 xl:col-span-2">
		<VideoSidebar />
	</div>
</div>
