<script lang="ts">
	import API from '$lib/api';
	import Icon from '@iconify/svelte';
	import type { Media } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import VideoTags from './VideoTags.svelte';

	let files: FileList | undefined;
	let title = '';
	let tags: string[] = [];

	const upload = async () => {
		const file = files?.[0];
		if (!file) return;

		const videoBody = {
			ext: file.name.split('.').pop(),
			title,
			tags
		};

		const response = await API.post('/upload/file', videoBody);

		const media: Media = await response.json();
		if (!media) throw new Error('media not found');

		try {
			const body = await file.arrayBuffer();
			const maxPartSize = 10 * 1024 * 1024;

			for (let i = 0; i < body.byteLength; i += maxPartSize) {
				const text = body.slice(i, i + maxPartSize);

				await API.post(`/upload/file/${media.id}/part`, text, {
					headers: new Headers({
						'Content-Type': 'application/octet-stream'
					}),
					raw: true
				});
			}

			await API.post(`/upload/file/${media.id}/complete`, videoBody);
		} catch (err) {
			console.error(err);
			await API.post(`/upload/file/${media.id}/cancel`);
		}
	};
</script>

<div class="grid min-h-full grid-cols-2 gap-4">
	<div class="flex max-w-md flex-col gap-4">
		<label
			class="hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/10 grid aspect-video w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-neutral-300 transition-all dark:border-neutral-700"
		>
			<div class="flex flex-col gap-2 text-center text-neutral-500 dark:text-neutral-400">
				{#if files}
					{#each Array.from(files) as file}
						<p>{file.name}</p>
					{/each}
				{:else}
					<span class="grid place-items-center text-xl">
						<Icon icon="fa6-solid:cloud-arrow-up" />
					</span>
					<p class="text-sm">Drag and drop files here</p>
				{/if}
			</div>
			<input class="hidden" accept="video/*" type="file" bind:files />
		</label>

		<Input placeholder="Title" bind:value={title} />
		<VideoTags bind:tags />

		<Button disabled={!files || !title.length} on:click={upload}>Upload</Button>
	</div>
</div>
