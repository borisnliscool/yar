<script lang="ts">
	import Formatter from '$lib/formatting';
	import type { Video } from '@repo/types';
	import { cn } from '@repo/utils';

	let className: string | undefined = undefined;

	export { className as class };
	export let video: Video | undefined;
	export let showDuration = true;

	let loaded = false;
</script>

<div
	class={cn(
		'relative z-0 mb-1 aspect-video w-full overflow-hidden rounded-md bg-neutral-300 dark:bg-neutral-700',
		className
	)}
>
	{#if video && showDuration && video.media.duration}
		<div class="absolute bottom-2 right-2 z-10 rounded bg-black/80 p-1 px-1.5 text-xs text-white">
			{Formatter.seconds(video.media.duration)}
		</div>
	{/if}

	{#if video && video.thumbnail?.url}
		<img
			crossorigin="anonymous"
			class="h-full w-full object-contain"
			src={video.thumbnail.url}
			alt={video.title}
			on:load={() => (loaded = true)}
		/>

		{#if loaded}
			<img
				crossorigin="anonymous"
				class="absolute left-0 top-0 -z-10 h-full w-full object-cover blur-lg"
				src={video.thumbnail.url}
				alt=""
			/>
		{/if}
	{:else}
		<div
			class="grid h-full w-full select-none place-items-center text-4xl font-semibold text-neutral-400 dark:text-neutral-500"
		>
			?
		</div>
	{/if}
</div>
