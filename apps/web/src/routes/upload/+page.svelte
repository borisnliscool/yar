<script lang="ts">
	import API from '$lib/api';
	import type { YtdlpVideo } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { instant } from '@repo/utils';
	import humanFormat from 'human-format';

	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import VideoFormat from './VideoFormat.svelte';

	dayjs.extend(duration);

	let videoInfo: Promise<YtdlpVideo>;
	let searching = false;
	let input = '';

	const search = instant(async () => {
		const url = new URL(input);

		videoInfo = new Promise(async (resolve, reject) => {
			searching = true;

			try {
				const response = await API.post('/upload/info', {
					url: url
				});

				resolve(await response.json());
			} catch (error) {
				reject(error);
			} finally {
				searching = false;
			}
		});
	});
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-4 py-4">
	<div class="flex items-center gap-2">
		<Input placeholder="Video URL" bind:value={input} on:paste={search} />
		<Button on:click={search} disabled={searching}>Search</Button>
	</div>

	<div class="flex flex-col gap-4">
		{#await videoInfo}
			loading..
		{:then videoData}
			{#if videoData}
				<img
					src={videoData.thumbnail}
					alt="video thumbnail"
					class="aspect-video w-full overflow-hidden rounded bg-neutral-400 object-contain dark:bg-neutral-700"
				/>

				<h1 class="text-2xl font-semibold">{videoData.fulltitle}</h1>

				<div class="flex flex-col">
					{#if videoData.duration}
						<p>
							Duration: <span class="font-semibold">
								{dayjs.duration(videoData.duration, 'seconds').format('HH:mm:ss')}
							</span>
						</p>
					{/if}

					{#if videoData.filesize_approx}
						<p>
							File size approximate: <span class="font-semibold">
								{humanFormat(videoData.filesize_approx)}
							</span>
						</p>
					{/if}
				</div>

				<div class="flex flex-col gap-2">
					<p class="font-semibold">Formats</p>
					<div class="flex max-h-96 flex-col gap-1 overflow-y-auto pr-1">
						{#each videoData.formats as format}
							<VideoFormat {format} />
						{/each}
					</div>
				</div>

				<!-- <pre>{JSON.stringify(videoData, null, 4)}</pre> -->
			{/if}
		{:catch error}
			failed! {error}
		{/await}
	</div>
</div>
