<script lang="ts">
	import type { Video } from '@repo/types';

	import dayjs from 'dayjs';
	import relativeType from 'dayjs/plugin/relativeTime';
	import VideoThumbnailImage from './VideoThumbnailImage.svelte';

	dayjs.extend(relativeType);

	export let video: Video;
</script>

<div class="group relative w-full overflow-hidden rounded-md">
	<VideoThumbnailImage {video} />

	<div
		class="absolute -bottom-full w-full bg-black/75 p-1 px-3 pb-2 text-white backdrop-blur-lg transition-all group-hover:bottom-0"
	>
		<p class="line-clamp-2 font-medium">{video.title}</p>
		<div class="flex items-center justify-between text-xs">
			<p>{video.author.username}</p>
			<p class="italic">{dayjs(video.created_at).fromNow()}</p>
		</div>
	</div>
</div>
