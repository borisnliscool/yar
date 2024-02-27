<script lang="ts">
	import type { Video } from '@repo/types';

	import dayjs from 'dayjs';
	import relativeType from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeType);

	export let video: Video;
</script>

<div>
	<div class="mb-1 aspect-video w-full rounded bg-gradient-to-br from-lime-500 to-blue-500">
		{#if video.thumbnail?.url}
			<img class="h-full w-full object-contain" src={video.thumbnail.url} alt={video.title} />
		{/if}
	</div>
	<div>
		<p class="mb-1 line-clamp-2 font-medium">{video.title}</p>
		<div class="flex items-center justify-between text-xs">
			<p>{video.author.username}</p>
			<p class="italic">{dayjs(video.created_at).fromNow()}</p>
		</div>
	</div>
</div>
