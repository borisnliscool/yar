<script lang="ts">
	import ProxiedImage from '$components/ProxiedImage.svelte';
	import API, { HttpError } from '$lib/api';
	import { ErrorType, type YtdlpFormat, type YtdlpVideo } from '@repo/types';
	import { Button, Input, Skeleton } from '@repo/ui';
	import { instant } from '@repo/utils';
	import humanFormat from 'human-format';
	import VideoFormat from './VideoFormat.svelte';

	import VideoTags from '$components/VideoTags.svelte';
	import { modals } from '$components/modalService';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';

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
	let extraTags = '';

	const search = instant(async () => {
		let url: URL;
		try {
			url = new URL(input);
		} catch {
			return;
		}

		// eslint-disable-next-line no-async-promise-executor
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

	const upload = async ({ force }: { force?: boolean } = {}) => {
		uploadLog = [];
		uploading = true;
		uploadPercent = 0;

		let params: Record<string, string> = {};
		if (force) params.force = 'true';

		try {
			const response = await API.post(
				'/upload/url',
				{
					input,
					url: selectedFormat?.url ?? input,
					ext: selectedFormat?.ext,
					tags: [...new Set([...tags, ...extraTags.split(',').filter(Boolean)])],
					title
				},
				{
					params
				}
			);

			extraTags = '';

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

						if ('video' in json) continue;
						if ('percent' in json) uploadPercent = Math.max(uploadPercent, json.percent);

						uploadLog = [...uploadLog, json];
					} catch (error) {
						console.log('error decoding json:', data);
						console.error(error);
					}
				}
			}
		} catch (error) {
			if (!(error instanceof HttpError)) {
				throw error;
			}

			if (error.code === 409 && error.type === ErrorType.MEDIA_ALREADY_EXISTS) {
				modals.create('confirm', {
					title: 'URL already exists',
					contents: 'A video with this url already exists. Do you want to upload it again?',
					buttons: [
						{
							label: 'Cancel',
							variant: 'outline'
						},
						{
							label: 'Upload Again',
							variant: 'success',
							onClick: async (hide) => {
								hide();
								await upload({ force: true });
							}
						}
					]
				});
			}
		}

		uploading = false;
	};
</script>

<svelte:head>
	<title>Upload{uploading ? 'ing' : ''} {uploading ? `${uploadPercent}% ` : ''}- YAR</title>
</svelte:head>

<div class="grid min-h-full grid-cols-2 gap-4">
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
			<Input placeholder="Video URL" bind:value={input} on:paste={() => search()} />
			<Button class="px-4" on:click={() => search()} disabled={searching}>Search</Button>
			<Button
				class="px-4"
				on:click={() => upload()}
				disabled={searching || !videoInfo || uploading}
			>
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

					<VideoTags bind:tags bind:value={extraTags} />

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
							{#each videoData.formats as format (format.format_id)}
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
				<p class="text-red-500">{error}</p>
			{/await}
		</div>
	</div>

	<div
		class="flex h-full max-h-screen flex-col gap-2 rounded border bg-neutral-50 p-4 dark:border-neutral-500 dark:bg-neutral-900"
	>
		<div class="text-md">Progress logs</div>

		<div class="h-full overflow-y-auto font-mono">
			{#each uploadLog as log (log)}
				<p>{JSON.stringify(log)}</p>
			{/each}
		</div>
	</div>
</div>
