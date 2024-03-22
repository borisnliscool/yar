<script lang="ts">
	import ProxiedImage from '$components/ProxiedImage.svelte';
	import API from '$lib/api';
	import type { YtdlpFormat, YtdlpVideo } from '@repo/types';
	import { Button, Input, Skeleton } from '@repo/ui';
	import { instant } from '@repo/utils';
	import humanFormat from 'human-format';
	import VideoFormat from './VideoFormat.svelte';

	import Header from '$components/Header.svelte';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import VideoTags from './VideoTags.svelte';

	dayjs.extend(duration);

	let videoInfo: Promise<YtdlpVideo>;
	let searching = false;
	let input = '';

	let uploading = false;
	let uploadPercent = 0;
	let uploadLog: string[] = [];

	let selectedFormat: YtdlpFormat | undefined;
	let title = '';
	let tags: string[] = [];

	const search = instant(async () => {
		let url: URL;
		try {
			url = new URL(input);
		} catch (err) {
			return;
		}

		videoInfo = new Promise(async (resolve, reject) => {
			searching = true;

			try {
				const response = await API.post('/upload/info', {
					url: url
				});

				const data = await response.json();
				title = data.title;

				resolve(data);
			} catch (error) {
				reject(error);
			} finally {
				searching = false;
			}
		});
	});

	const upload = async () => {
		uploadLog = [];
		uploading = true;
		uploadPercent = 0;

		const response = await API.post('/upload/url', {
			url: selectedFormat?.url ?? input,
			ext: selectedFormat?.ext,
			title,
			tags
		});

		const reader = response.body?.getReader();
		if (!reader) return;

		while (true) {
			const data = await reader.read();
			if (data.done) break;

			const decoded = new TextDecoder()
				.decode(data.value!)
				.split('\n')
				.map((d) => d.trim())
				.filter(Boolean);

			for (const data of decoded) {
				try {
					const json = JSON.parse(data);
					uploadLog = [...uploadLog, json];

					if ('percent' in json) {
						uploadPercent = Math.max(uploadPercent, json.percent);
					}

					// if ('success' in json) {
					// 	if (!json.success) {
					// 		console.log(json);
					// 		break;
					// 	}

					// 	const video = json.video as Video;
					// 	console.log(video);
					// }
				} catch (error) {
					console.log('error decoding json:', data);
					console.error(error);
				}
			}
		}

		uploading = false;
	};
</script>

<div
	class="flex h-full min-h-screen flex-col bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white"
>
	<Header />

	<div class="grid h-full min-h-[calc(100vh-4rem)] grid-cols-5 gap-4 p-4">
		<!-- <div class="h-full w-full rounded-lg bg-white p-4 shadow dark:bg-neutral-800">
			Download Queue
		</div> -->

		<div
			class="col-span-5 grid h-full grid-cols-2 gap-4 rounded-lg bg-white p-4 shadow dark:bg-neutral-800"
		>
			<div class="flex h-full flex-col gap-4">
				{#if uploading}
					<div class="relative z-0 h-16 w-full rounded border border-green-500">
						<div
							class="absolute top-0 -z-10 h-full bg-green-600/50"
							style="width: {uploadPercent}%"
						></div>

						<p class="z-10 grid h-full w-full place-items-center">Uploading - {uploadPercent}%</p>
					</div>
				{/if}

				<div class="flex items-center gap-2">
					<Input placeholder="Video URL" bind:value={input} on:paste={search} />
					<Button class="px-4" on:click={search} disabled={searching}>Search</Button>
					<Button class="px-4" on:click={upload} disabled={searching || !videoInfo || uploading}>
						Upload
					</Button>
				</div>

				<div class="flex flex-col gap-4">
					{#await videoInfo}
						<Skeleton class="aspect-video w-full" />
						<Skeleton class="h-10 w-full" />
					{:then videoData}
						{#if videoData}
							<ProxiedImage
								url={videoData.thumbnail}
								class="aspect-video w-full overflow-hidden rounded bg-neutral-400 object-contain dark:bg-neutral-700"
							/>

							<h1 class="text-2xl font-semibold">
								<Input bind:value={title} placeholder="Title" />
							</h1>

							<VideoTags bind:tags />

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
										<VideoFormat
											{format}
											selected={format == selectedFormat}
											on:click={() => {
												selectedFormat = selectedFormat == format ? undefined : format;
											}}
										/>
									{/each}
								</div>
							</div>
						{/if}
					{:catch error}
						failed! {error}
					{/await}
				</div>
			</div>

			<div
				class="flex h-full max-h-screen flex-col gap-2 rounded border p-4 dark:border-neutral-500"
			>
				<div class="text-md">Progress logs</div>

				<div class="h-full overflow-y-auto font-mono">
					{#each uploadLog as log}
						<pre>{JSON.stringify(log, null, 4)}</pre>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
