<script lang="ts">
	import Icon from '@iconify/svelte';
	import { cn } from '@repo/utils';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { tv } from 'tailwind-variants';
	import type { NotificationType } from './index';

	export let type: NotificationType = 'info';
	export let dismissible = true;

	let className: string = '';
	export { className as class };

	const dispatcher = createEventDispatcher();
	const dismiss = () => dispatcher('dismiss');

	const variants = tv({
		base: 'w-fit max-w-md rounded shadow flex items-center justify-between text-sm',
		variants: {
			type: {
				info: 'bg-blue-500 text-white',
				error: 'bg-red-600 text-white',
				success: 'bg-green-600 text-white'
			}
		}
	});
</script>

<div class={cn(variants({ type }), className)} transition:fade>
	<p class="px-4 py-3">
		<slot />
	</p>

	{#if dismissible}
		<button class="py-3 pr-5" on:click|once={dismiss}>
			<Icon icon="fa6-solid:xmark" />
		</button>
	{/if}
</div>
