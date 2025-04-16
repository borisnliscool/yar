<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { YtdlpFormat } from '@repo/types';
	import { Button } from '@repo/ui';
	import { cn } from '@repo/utils';
	import humanFormat from 'human-format';
	import { createEventDispatcher } from 'svelte';
	import { scale } from 'svelte/transition';

	export let format: YtdlpFormat;
	export let selected = false;

	const dispatcher = createEventDispatcher<{
		click: boolean;
	}>();

	const click = () => {
		selected = !selected;
		dispatcher('click', selected);
	};
</script>

<Button
	variant="ghost"
	class={cn(
		'flex h-fit items-center justify-between gap-2 rounded-lg border bg-neutral-50 px-4 py-2 dark:border-neutral-700 dark:bg-transparent',
		{
			'!border-green-500 !bg-green-500/10': selected
		}
	)}
	on:click={click}
>
	{#if selected}
		<div class="relative grid aspect-square w-5 place-items-center text-lg" in:scale>
			<span class="grid place-items-center text-neutral-400" class:text-green-500={selected}>
				<Icon icon="ri:check-fill" class="absolute" />
			</span>
		</div>
	{/if}

	<div class="flex w-full items-center justify-between">
		<p class="text-md font-semibold">{format.format}</p>
		<div class="text-right text-xs">
			<p>
				File Size:
				<span class="font-semibold">
					{#if format.filesize}
						{humanFormat(format.filesize)}
					{:else}
						unknown
					{/if}
				</span>
			</p>

			<p>
				File Type: <span class="font-semibold">{format.ext}</span>
			</p>
		</div>
	</div>
</Button>
