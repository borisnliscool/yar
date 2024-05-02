<script lang="ts">
	import type { Video } from '@repo/types';

	import dayjs from 'dayjs';
	import relativeType from 'dayjs/plugin/relativeTime';
	import VideoThumbnailImage from './VideoThumbnailImage.svelte';

	dayjs.extend(relativeType);

	export let video: Video;
</script>

<div class="grid grid-cols-7 gap-4">
	<VideoThumbnailImage class="col-span-3" {video} />

	<div class="col-span-4">
		<p class="mb-1 line-clamp-2 text-lg font-medium">{video.title}</p>
		<div class="flex items-center justify-between text-xs">
			<p>{video.author.username}</p>
			<p class="italic">{dayjs(video.created_at).fromNow()}</p>
		</div>
	</div>
</div>
