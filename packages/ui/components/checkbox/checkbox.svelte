<script lang="ts">
	import { cn } from '@repo/utils';

	let className: string | undefined = undefined;
	export let value: boolean = false;
	export { className as class };
</script>

<label class="cursor-pointer">
	<input type="checkbox" name="checkbox" class="sr-only" bind:checked={value} />

	<div
		class={cn(className, 'h-6 w-12 rounded-full flex text-white relative transition-all')}
		class:bg-neutral-800={!value}
		class:bg-blue-600={value}
	>
		<span
			class="aspect-square rounded-full transition-all shadow"
			class:bg-neutral-500={!value}
			class:bg-white={value}
			class:translate-x-full={value}
		/>
	</div>
</label>
