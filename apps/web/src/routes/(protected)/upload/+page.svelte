<script lang="ts">
	import ProxiedImage from '$components/ProxiedImage.svelte';
	import API from '$lib/api';
	import type { YtdlpVideo } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { instant } from '@repo/utils';
	import humanFormat from 'human-format';
	import VideoFormat from './VideoFormat.svelte';

	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';

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

<div
	class="grid h-screen max-h-screen grid-cols-5 gap-4 bg-neutral-100 p-4 text-black dark:bg-neutral-900 dark:text-white"
>
	<div class="h-full w-full rounded-lg bg-white p-4 shadow dark:bg-neutral-800">Download Queue</div>
	<div
		class="col-span-4 grid h-full grid-cols-2 gap-4 overflow-y-auto rounded-lg bg-white p-4 shadow dark:bg-neutral-800"
	>
		<div class="flex h-full flex-col gap-4">
			<div class="flex items-center gap-2">
				<Input placeholder="Video URL" bind:value={input} on:paste={search} />
				<Button class="px-4" on:click={search} disabled={searching}>Search</Button>
			</div>

			<div class="flex flex-col gap-4">
				{#await videoInfo}
					loading..
				{:then videoData}
					{#if videoData}
						<ProxiedImage
							url={videoData.thumbnail}
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
					{/if}
				{:catch error}
					failed! {error}
				{/await}
			</div>
		</div>

		<div class="h-full rounded border p-4 dark:border-neutral-500">Progress logs</div>
	</div>
</div>
