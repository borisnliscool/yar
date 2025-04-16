<script lang="ts">
	import { intersection } from '$actions';
	import { createEventDispatcher } from 'svelte';

	//eslint-disable-next-line no-undef
	type T = $$Generic;

	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface $$Slots {
		default: {
			item: T;
		};
	}

	let rest: T[] = [];
	let lastItem: T;

	$: {
		rest = items.slice(0, -1);
		lastItem = items[items.length - 1];
	}

	const dispatch = createEventDispatcher<{
		loadmore: void;
	}>();
	const handleIntersection = () => dispatch('loadmore');

	export let items: T[] = [];
</script>

{#each rest as item (item)}
	<slot {item} />
{/each}

{#if lastItem}
	{#key lastItem}
		<div use:intersection={{ once: true }} on:intersection={handleIntersection}>
			<slot item={lastItem} />
		</div>
	{/key}
{/if}
