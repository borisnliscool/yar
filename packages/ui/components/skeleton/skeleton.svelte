<script lang="ts">
	import { cn } from '@repo/utils';

	let className: string | undefined = undefined;
	export { className as class };
</script>

<div class={cn('w-full animate-pulse rounded bg-neutral-400 dark:bg-neutral-600', className)}></div>
