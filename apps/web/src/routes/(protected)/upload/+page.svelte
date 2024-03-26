<script lang="ts">
	import Header from '$components/Header.svelte';
	import { Button } from '@repo/ui';
	import { cn } from '@repo/utils';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import UploadFile from './UploadFile.svelte';
	import UploadWithUrl from './UploadWithUrl.svelte';

	let currentPage: 'uploadWithUrl' | 'uploadFile' = 'uploadWithUrl';

	dayjs.extend(duration);
</script>

<div
	class="flex h-full min-h-screen flex-col overflow-y-auto bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white"
>
	<Header />

	<div class="flex flex-col gap-4 p-4">
		<div class="flex items-center gap-2 rounded-lg">
			<Button
				class={cn(
					'w-full rounded bg-white text-center text-black shadow transition-all dark:bg-neutral-700 dark:text-white',
					currentPage === 'uploadWithUrl' && '!bg-primary-500 text-white'
				)}
				variant="ghost"
				on:click={() => (currentPage = 'uploadWithUrl')}
			>
				Upload with URL
			</Button>
			<Button
				class={cn(
					'w-full rounded bg-white text-center text-black shadow transition-all dark:bg-neutral-700 dark:text-white',
					currentPage === 'uploadFile' && '!bg-primary-500 text-white'
				)}
				variant="ghost"
				on:click={() => (currentPage = 'uploadFile')}
			>
				Upload File
			</Button>
		</div>

		<div class="relative grid h-full min-h-[calc(100vh-9.75rem)] gap-4">
			{#if currentPage === 'uploadWithUrl'}
				<UploadWithUrl />
			{/if}

			{#if currentPage === 'uploadFile'}
				<UploadFile />
			{/if}
		</div>
	</div>
</div>
