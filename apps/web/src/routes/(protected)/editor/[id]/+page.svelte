<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Header from '$components/Header.svelte';
	import VideoTags from '$components/VideoTags.svelte';
	import { modals } from '$components/modalService';
	import { notifications } from '$components/notifications';
	import API from '$lib/api';
	import { userStore } from '$lib/stores/user';
	import type { Video } from '@repo/types';
	import { Button, Input, Skeleton, Textarea } from '@repo/ui';
	import { get } from 'svelte/store';

	let videoPromise: Promise<Video>;
	let loadedVideo: Video;
	let extraTags = '';

	let isBusy = false;
	let thumbnailInput: HTMLInputElement;
	let thumbnails: FileList | null = null;

	const redirect = () => {
		notifications.error('You are not allowed to edit this video');
		return goto('/');
	};

	const loadVideo = (videoId: string) => {
		// eslint-disable-next-line no-async-promise-executor
		videoPromise = new Promise<Video>(async (resolve, reject) => {
			const response = await API.get('/videos/' + videoId);
			const data: Video = await response.json();
			loadedVideo = data;

			if (loadedVideo.author.id !== get(userStore)?.id) {
				return reject(redirect());
			}

			return resolve(data);
		});
	};

	const save = async () => {
		isBusy = true;

		try {
			if (thumbnails && thumbnails.length) {
				const data = new FormData();
				data.append('thumbnail', thumbnails[0]);

				await API.put('/videos/' + loadedVideo.id + '/thumbnail', data, {
					raw: true
				});

				thumbnails = null;
			}

			await API.put('/videos/' + loadedVideo.id, {
				title: loadedVideo.title,
				description: loadedVideo.description,
				tags: [...new Set([...loadedVideo.tags, ...extraTags.split(',').filter(Boolean)])]
			});

			extraTags = '';

			loadVideo(loadedVideo.id);
		} catch (err) {
			console.error(err);
			notifications.error('Failed to save video');
		}

		isBusy = false;
	};

	const deleteVideo = async () => {
		modals.create('delete-video', {
			title: 'Delete Video',
			contents: 'Are you sure you want to delete this video? This action cannot be undone.',
			buttons: [
				{
					label: 'Cancel',
					variant: 'outline'
				},
				{
					label: 'Delete',
					variant: 'destructive',
					onClick: async (hide) => {
						isBusy = true;
						try {
							await API.delete('/videos/' + loadedVideo.id);
							notifications.success('Video deleted');
							hide();
							goto('/');
						} catch (err) {
							console.error(err);
						}
						isBusy = false;
					}
				}
			]
		});
	};

	const regenerateThumbnail = async () => {
		try {
			await API.post('/videos/' + loadedVideo.id + '/thumbnail/regenerate');
			loadVideo(loadedVideo.id);
		} catch (err) {
			console.error(err);
			notifications.error('Failed to regenerate thumbnail');
		}
	};

	$: loadVideo($page.params.id);
	$: if ($userStore && loadedVideo && loadedVideo.author.id !== $userStore.id) redirect();
</script>

<svelte:head>
	<title>{loadedVideo ? 'Editing - ' + loadedVideo.title : 'Loading...'}</title>
</svelte:head>

<Header />

<div class="grid place-items-center">
	<div class="flex w-full flex-col items-center gap-4 py-8">
		{#key videoPromise}
			{#await videoPromise}
				<div class="flex w-full max-w-2xl flex-col gap-4">
					<Skeleton class="aspect-video w-full" />
					<Skeleton class="h-16" />
				</div>
				<!--eslint-disable-next-line @typescript-eslint/no-unused-vars-->
			{:then _}
				<div class="flex w-full max-w-2xl flex-col gap-4">
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

					<div class="flex items-center justify-between">
						<Button class="w-fit" size="sm" on:click={regenerateThumbnail}>
							Regenerate thumbnail
						</Button>

						{#if thumbnails && thumbnails.length > 0}
							<Button
								class="w-fit"
								size="sm"
								variant="outline"
								on:click={() => (thumbnails = null)}
							>
								Clear thumbnail
							</Button>
						{/if}
					</div>

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
						<VideoTags bind:tags={loadedVideo.tags} bind:value={extraTags} />
					</div>
				</div>

				<div class="sticky bottom-0 w-full">
					<div
						class="grid place-items-center bg-white/25 py-2 backdrop-blur-md dark:bg-neutral-900/25"
					>
						<div class="flex w-full max-w-2xl items-center justify-end gap-2">
							<Button
								class="w-fit px-6 py-1.5"
								disabled={isBusy}
								variant="destructive"
								on:click={deleteVideo}
							>
								Delete
							</Button>

							<Button class="w-fit px-6 py-1.5" disabled={isBusy} on:click={save}>Save</Button>
						</div>
					</div>
				</div>
			{/await}
		{/key}
	</div>
</div>
