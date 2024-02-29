<script lang="ts">
	import API from '$lib/api';
	import { Skeleton } from '@repo/ui';
	import { cn } from '@repo/utils';
	import { onMount } from 'svelte';

	let className: string | undefined | null = undefined;

	export { className as class };
	export let url: string;
	export let alt = '';

	let src: string;

	onMount(async () => {
		const response = await API.get(`/proxy/image/${btoa(url)}`);
		const blob = await response.blob();
		src = URL.createObjectURL(blob);
	});
</script>

{#if src}
	<img {src} {alt} class={cn('h-full w-full', className)} />
{:else}
	<Skeleton class={cn('h-full w-full', className)} />
{/if}
