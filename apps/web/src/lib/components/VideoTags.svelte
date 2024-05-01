<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Input } from '@repo/ui';

	export let tags: string[];
	let value: string;

	const keyup = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		tags = [...tags, value].filter(Boolean);
		value = '';
	};
</script>

<div class="flex flex-col gap-2">
	<Input placeholder="Video tags" bind:value on:keyup={keyup} />

	<div class="flex flex-wrap gap-1 text-sm">
		{#each tags as tag}
			<div
				class="flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 dark:border-neutral-700"
			>
				{tag}

				<button
					class="grid cursor-pointer place-items-center"
					on:click={() => (tags = tags.filter((t) => t !== tag))}
				>
					<Icon icon="mdi:times" />
				</button>
			</div>
		{/each}
	</div>
</div>
