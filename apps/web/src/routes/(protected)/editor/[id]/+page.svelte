<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import VideoTags from '$components/VideoTags.svelte';
	import API from '$lib/api';
	import type { Video } from '@repo/types';
	import { Button, Input, Skeleton, Textarea } from '@repo/ui';

	let videoPromise: Promise<Video>;
	let loadedVideo: Video;

	let thumbnailInput: HTMLInputElement;
	let saving = false;
	let thumbnails: FileList | null = null;

	const loadVideo = (videoId: string) => {
		videoPromise = new Promise<Video>(async (resolve) => {
			const response = await API.get('/videos/' + videoId);
			const data: Video = await response.json();
			loadedVideo = data;
			return resolve(data);
		});
	};

	const save = async () => {
		saving = true;
		try {
			if (thumbnails && thumbnails.length) {
				const data = new FormData();
				data.append('thumbnail', thumbnails[0]);

				await API.put('/videos/' + loadedVideo.id + '/thumbnail', data, {
					raw: true
				});
			}

			videoPromise = (
				await API.put('/videos/' + loadedVideo.id, {
					title: loadedVideo.title,
					description: loadedVideo.description,
					tags: loadedVideo.tags
				})
			).json();
		} catch (err) {
			console.error(err);
		}
		saving = false;
	};

	$: loadVideo($page.params.id);
</script>

<svelte:head>
	<title>{loadedVideo ? 'Editing - ' + loadedVideo.title : 'Loading...'} - YAR</title>
</svelte:head>

<Header />

<div class="grid place-items-center">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-4 py-8">
		{#key videoPromise}
			{#await videoPromise}
				<Skeleton class="aspect-video w-full" />
			{:then _}
				<input
					type="file"
					accept="image/*"
					class="hidden"
					bind:this={thumbnailInput}
					bind:files={thumbnails}
				/>

				<Button
					variant="ghost"
					on:click={() => thumbnailInput.click()}
					class="mb-1 aspect-video h-auto w-full overflow-hidden rounded-md bg-neutral-300 p-0 dark:bg-neutral-700"
				>
					{#if thumbnails && thumbnails.length > 0}
						<img
							crossorigin="anonymous"
							class="h-full w-full object-contain"
							src={URL.createObjectURL(thumbnails[0])}
							alt={loadedVideo.title}
						/>
					{:else if loadedVideo.thumbnail?.url}
						<img
							crossorigin="anonymous"
							class="h-full w-full object-contain"
							src={loadedVideo.thumbnail.url}
							alt={loadedVideo.title}
						/>
					{:else}
						<div
							class="grid h-full w-full select-none place-items-center text-4xl font-semibold text-neutral-400 dark:text-neutral-500"
						>
							?
						</div>
					{/if}
				</Button>

				{#if thumbnails && thumbnails.length > 0}
					<Button
						class="ml-auto w-fit"
						size="sm"
						variant="outline"
						on:click={() => (thumbnails = null)}
					>
						Clear thumbnail
					</Button>
				{/if}

				<div>
					<p class="mb-0.5 text-sm text-neutral-400">Title</p>
					<Input bind:value={loadedVideo.title} placeholder="Title" />
				</div>

				<div>
					<p class="mb-0.5 text-sm text-neutral-400">Description</p>
					<Textarea
						bind:value={loadedVideo.description}
						class="h-full min-h-24"
						placeholder="Description"
					/>
				</div>

				<div>
					<p class="mb-0.5 text-sm text-neutral-400">Video Tags</p>
					<VideoTags bind:tags={loadedVideo.tags} />
				</div>

				<Button class="sticky bottom-0 ml-auto w-fit px-6 py-1.5" disabled={saving} on:click={save}>
					Save
				</Button>
			{/await}
		{/key}
	</div>
</div>
