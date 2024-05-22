<script lang="ts">
	import API from '$lib/api';
	import Icon from '@iconify/svelte';
	import { Button } from '@repo/ui';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	let content = '';

	onMount(() => {
		API.get('/settings/motd')
			.then((r) => r.json())
			.then((data) => {
				if (!data.motd) return;
				content = data.motd;
			})
			.catch();
	});
</script>

{#if content}
	<div
		transition:slide
		class="flex w-full items-center justify-between bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-4 py-2 text-center text-sm text-white"
	>
		<div class="w-4"></div>

		<p>{content}</p>

		<Button
			on:click={() => (content = '')}
			variant="ghost"
			class="text-md h-fit w-4 cursor-pointer p-0 font-bold"
		>
			<Icon icon="fa6-solid:xmark" />
		</Button>
	</div>
{/if}
