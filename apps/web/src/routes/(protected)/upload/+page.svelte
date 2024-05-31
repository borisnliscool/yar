<script lang="ts">
	import Header from '$components/Header.svelte';
	import { userStore } from '$lib/stores/user';
	import { UserRole } from '@repo/types';
	import { Button } from '@repo/ui';
	import { cn } from '@repo/utils';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import UploadFile from './UploadFile.svelte';
	import UploadFromDisk from './UploadFromDisk.svelte';
	import UploadWithUrl from './UploadWithUrl.svelte';

	let currentPage: 'uploadWithUrl' | 'uploadFile' | 'uploadFromDisk' = 'uploadWithUrl';

	dayjs.extend(duration);
</script>

<div
	class="flex h-full min-h-screen flex-col overflow-y-auto bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white"
>
	<Header />

	<div class="flex flex-col gap-4 p-6">
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

			{#if $userStore && $userStore.roles.includes(UserRole.ADMIN)}
				<Button
					class={cn(
						'w-full rounded bg-white text-center text-black shadow transition-all dark:bg-neutral-700 dark:text-white',
						currentPage === 'uploadFromDisk' && '!bg-primary-500 text-white'
					)}
					variant="ghost"
					on:click={() => (currentPage = 'uploadFromDisk')}
				>
					Upload From Disk
				</Button>
			{/if}
		</div>

		<div class="relative grid h-full min-h-[calc(100vh-10.5rem)] gap-4">
			<div
				class="absolute -z-10 h-full w-full overflow-y-auto rounded-lg bg-white p-4 opacity-0 shadow transition-all dark:bg-neutral-800"
				class:opacity-100={currentPage === 'uploadWithUrl'}
				class:z-10={currentPage === 'uploadWithUrl'}
			>
				<UploadWithUrl />
			</div>
			<div
				class="absolute -z-10 h-full w-full overflow-y-auto rounded-lg bg-white p-4 opacity-0 shadow transition-all dark:bg-neutral-800"
				class:opacity-100={currentPage === 'uploadFile'}
				class:z-10={currentPage === 'uploadFile'}
			>
				<UploadFile />
			</div>

			<div
				class="absolute -z-10 h-full w-full overflow-y-auto rounded-lg bg-white p-4 opacity-0 shadow transition-all dark:bg-neutral-800"
				class:opacity-100={currentPage === 'uploadFromDisk'}
				class:z-10={currentPage === 'uploadFromDisk'}
			>
				<UploadFromDisk />
			</div>
		</div>
	</div>
</div>
