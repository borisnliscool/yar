<script lang="ts">
	import API from '$lib/api';
	import Icon from '@iconify/svelte';
	import { Button, Input } from '@repo/ui';
	import { instant } from '@repo/utils';
	import { SvelteComponent, onMount } from 'svelte';

	export let tags: string[];
	let value: string = '';

	let databaseTags: string[] = [];
	let filteredTags: string[] = [];

	let inputElement: SvelteComponent;
	let inputParent: HTMLDivElement;

	let hasFocus = false;

	const keyup = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		tags = [...tags, value].filter(Boolean);
		value = '';
	};

	// TODO: do we want to use a fuzzy search here?
	$: filteredTags = databaseTags
		.filter((tag) => !tags.includes(tag) && tag.toLowerCase().includes(value.toLowerCase()))
		.toSorted((a, b) => a.localeCompare(b));

	onMount(() => {
		API.get('/videos/tags')
			.then((response) => response.json())
			.then((data) => {
				databaseTags = data.tags;
			});

		const focusIn = () => (hasFocus = true);
		const focusOut = instant(() => (hasFocus = !!inputParent.querySelector(':focus-within')));

		inputParent.addEventListener('focusin', focusIn);
		inputParent.addEventListener('focusout', focusOut);

		return () => {
			inputParent.removeEventListener('focusin', focusIn);
			inputParent.removeEventListener('focusout', focusOut);
		};
	});
</script>

<div class="flex flex-col gap-2">
	<div class="relative" bind:this={inputParent}>
		<Input placeholder="Video tags" bind:value bind:this={inputElement} on:keyup={keyup} />

		{#if hasFocus && filteredTags.length}
			<div
				class="absolute left-0 top-full z-50 mt-1 max-h-48 w-full select-none overflow-y-auto rounded-md bg-white px-3 py-2 text-sm text-black shadow-md dark:bg-neutral-800 dark:text-white"
				tabindex="-1"
			>
				{#each filteredTags as tag}
					<Button
						tabindex={0}
						variant="ghost"
						class="w-full text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
						on:click={() => {
							tags = [...tags, tag];
							value = '';
							inputElement.focus();
						}}
					>
						<p class="w-full">{tag}</p>
					</Button>
				{/each}
			</div>
		{/if}
	</div>

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
