<script lang="ts">
	import API from '$lib/api';
	import type { ImportFile } from '@repo/types';
	import { Skeleton } from '@repo/ui';
	import { onMount } from 'svelte';
	import DisplayFile from './DisplayFile.svelte';

	let filePromise: Promise<{ files: ImportFile[] }>;

	onMount(() => {
		filePromise = API.get('/upload/import/available').then(
			(r) => r.json() as Promise<{ files: ImportFile[] }>
		);
	});
</script>

<div>
	{#await filePromise}
		<Skeleton class="h-32" />
	{:then value}
		{#if value && value.files}
			{#each value.files as file}
				<DisplayFile {file} />
			{/each}
		{/if}
	{/await}
</div>
