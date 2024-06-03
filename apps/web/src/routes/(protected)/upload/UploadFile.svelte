<script lang="ts">
	import VideoTags from '$components/VideoTags.svelte';
	import { notifications } from '$components/notifications';
	import API from '$lib/api';
	import Icon from '@iconify/svelte';
	import type { Media } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { onMount } from 'svelte';

	let files: FileList | undefined;
	let title = '';
	let url = '';
	let tags: string[] = [];

	let dragOver = false;
	let label: HTMLLabelElement;

	const handleDragOver = (event: DragEvent) => {
		event.preventDefault();
		dragOver = true;
	};

	const handleDragLeave = () => {
		dragOver = false;
	};

	const handleDrop = (event: DragEvent) => {
		event.preventDefault();
		dragOver = false;

		if (event.dataTransfer) {
			files = event.dataTransfer.files;
		}
	};

	const upload = async () => {
		const file = files?.[0];
		if (!file) return;

		const videoBody = {
			ext: file.name.split('.').pop(),
			title,
			tags,
			url
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

			notifications.success('Video uploaded');
		} catch (err) {
			console.error(err);
			await API.post(`/upload/file/${media.id}/cancel`);
			notifications.error('Failed to upload video');
		}
	};

	onMount(() => {
		// For some reason, 'on:drop' doesn't work on the label element. This is a workaround.
		label.addEventListener('drop', handleDrop);
		return () => label.removeEventListener('drop', handleDrop);
	});

	$: if (files && files.length && !title.length) title = files[0].name;
</script>

<div class="grid min-h-full place-items-center gap-4">
	<div class="flex w-full max-w-lg flex-col gap-4">
		<label
			bind:this={label}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			class="hover:dragging hover:border-primary-500 hover:dark:border-primary-500 hover:bg-primary-500/10 hover:dark:bg-primary-500/10 grid aspect-video w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-neutral-300 p-8 transition-all dark:border-neutral-700"
			class:dragging={dragOver}
		>
			<div class="flex flex-col gap-2 text-center text-neutral-500 dark:text-neutral-400">
				{#if files}
					<p class="font-semibold">Selected:</p>
					{#each Array.from(files) as file}
						<p>{file.name}</p>
					{/each}
				{:else}
					<span class="grid place-items-center text-xl" class:animate-bounce={dragOver}>
						<Icon icon="fa6-solid:cloud-arrow-up" />
					</span>
					<p class="text-sm">Drag and drop files here</p>
				{/if}
			</div>
			<input class="hidden" accept="video/*" type="file" bind:files />
		</label>

		<Input placeholder="Title" bind:value={title} />
		<Input placeholder="Source URL (optional)" bind:value={url} />
		<VideoTags bind:tags />

		<Button disabled={!files || !title.length} on:click={upload}>Upload</Button>
	</div>
</div>

<style lang="scss">
	:global(.dragging) {
		@apply border-primary-500 dark:border-primary-500 bg-primary-500/10 dark:bg-primary-500/10;
	}
</style>
