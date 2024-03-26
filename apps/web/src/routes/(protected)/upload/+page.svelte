<script lang="ts">
	import Header from '$components/Header.svelte';
	import { Button } from '@repo/ui';
	import { cn } from '@repo/utils';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import { fade } from 'svelte/transition';
	import UploadFile from './UploadFile.svelte';
	import UploadWithUrl from './UploadWithUrl.svelte';

	let currentPage: 'uploadWithUrl' | 'uploadFile' = 'uploadWithUrl';

	dayjs.extend(duration);
</script>

<div
	class="flex h-full min-h-screen flex-col bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white"
>
	<Header />

	<div class="flex flex-col gap-4 p-4">
		<div class="flex items-center gap-2 rounded-lg">
			<Button
				class={cn(
					'w-full rounded bg-neutral-100 text-center text-black shadow transition-all dark:bg-neutral-800 dark:text-white',
					currentPage === 'uploadWithUrl' && 'bg-white dark:bg-neutral-700'
				)}
				variant="ghost"
				on:click={() => (currentPage = 'uploadWithUrl')}
			>
				Upload with URL
			</Button>
			<Button
				class={cn(
					'w-full rounded bg-neutral-100 text-center text-black shadow transition-all dark:bg-neutral-800 dark:text-white',
					currentPage === 'uploadFile' && 'bg-white dark:bg-neutral-700'
				)}
				variant="ghost"
				on:click={() => (currentPage = 'uploadFile')}
			>
				Upload File
			</Button>
		</div>

		<div class="relative grid h-full min-h-[calc(100vh-9.5rem)] gap-4">
			{#if currentPage === 'uploadWithUrl'}
				<div transition:fade={{ duration: 150 }} class="absolute h-full w-full">
					<UploadWithUrl />
				</div>
			{/if}
			{#if currentPage === 'uploadFile'}
				<div transition:fade={{ duration: 150 }} class="absolute h-full w-full">
					<UploadFile />
				</div>
			{/if}
		</div>
	</div>
</div>
