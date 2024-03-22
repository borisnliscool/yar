<script lang="ts">
	import type { Video } from '@repo/types';

	import dayjs from 'dayjs';
	import relativeType from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeType);

	export let video: Video;
</script>

<div class="grid grid-cols-7 gap-4">
	<div
		class="col-span-3 mb-1 aspect-video w-full overflow-hidden rounded-md bg-neutral-300 dark:bg-neutral-700"
	>
		{#if video.thumbnail?.url}
			<img
				crossorigin="anonymous"
				class="h-full w-full object-contain"
				src={video.thumbnail.url}
				alt={video.title}
			/>
		{:else}
			<div
				class="grid h-full w-full select-none place-items-center text-4xl font-semibold text-neutral-400 dark:text-neutral-500"
			>
				?
			</div>
		{/if}
	</div>

	<div class="col-span-4">
		<p class="mb-1 line-clamp-2 text-lg font-medium">{video.title}</p>
		<div class="flex items-center justify-between text-xs">
			<p>{video.author.username}</p>
			<p class="italic">{dayjs(video.created_at).fromNow()}</p>
		</div>
	</div>
</div>
