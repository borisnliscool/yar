<script lang="ts">
	import { cn } from '@repo/utils';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { TextareaEvents } from '.';

	type $$Props = HTMLTextareaAttributes;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	type $$Events = TextareaEvents;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = undefined;
	export { className as class };
</script>

<textarea
	class={cn(
		'focus-visible:ring-primary-300/50 dark:focus-visible:ring-primary-500/50 focus-visible:border-primary-500 dark:focus-visible:border-primary-500 flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm file:border-0 file:text-sm file:font-medium placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-500 dark:placeholder:text-neutral-400',
		className
	)}
	bind:value
	on:blur
	on:change
	on:click
	on:focus
	on:focusin
	on:focusout
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
	{...$$restProps}
/>
