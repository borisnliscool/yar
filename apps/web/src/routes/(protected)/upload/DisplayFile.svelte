<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { ImportFile } from '@repo/types';
	import { Button } from '@repo/ui';
	import { createEventDispatcher } from 'svelte';

	export let file: ImportFile;
	let open = false;

	const dispatcher = createEventDispatcher();

	const click = () => {
		if (file.type == 'directory') open = !open;
		else dispatcher('click', file);
	};
</script>

<Button
	on:click={click}
	variant="ghost"
	class="flex h-fit items-center gap-2 p-0 text-left text-base"
>
	<div class="w-3">
		{#if file.type == 'directory'}
			<Icon
				icon="fa6-solid:caret-right"
				class="text-neutral-500 transition {open ? 'rotate-90' : ''}"
			/>
		{/if}
	</div>

	<div class="grid w-4 place-items-center">
		<Icon
			icon="fa6-solid:{file.type == 'directory' ? (open ? 'folder-open' : 'folder') : 'file'}"
		/>
	</div>

	<p>{file.name}</p>
</Button>

{#if file.type == 'directory' && open}
	<div class="w-full pl-4">
		{#if file.children?.length}
			{#each file.children.filter((f) => f.type == 'directory') as child}
				<svelte:self on:click file={child} />
			{/each}

			{#each file.children.filter((f) => f.type == 'file') as child}
				<svelte:self on:click file={child} />
			{/each}
		{:else}
			<p class="pl-6 text-sm text-neutral-400 dark:text-neutral-700">&lt;empty directory&gt;</p>
		{/if}
	</div>
{/if}
