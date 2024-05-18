<script lang="ts">
	import { cn } from '@repo/utils';

	let className: string | undefined = undefined;
	export let value: boolean = false;
	export { className as class };
</script>

<label class="cursor-pointer">
	<input type="checkbox" name="checkbox" class="sr-only" bind:checked={value} />

	<div
		class={cn(
			'h-6 w-12 rounded-full flex text-white relative transition-all bg-neutral-200 dark:bg-neutral-800',
			className
		)}
		class:!bg-blue-600={value}
	>
		<span
			class="aspect-square rounded-full transition-all shadow bg-neutral-400 dark:bg-neutral-500"
			class:!bg-white={value}
			class:translate-x-full={value}
		/>
	</div>
</label>
