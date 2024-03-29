<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '@repo/ui';

	let files: FileList | undefined;
</script>

<div class="grid h-full grid-cols-2 gap-4 rounded-lg bg-white p-4 shadow dark:bg-neutral-800">
	<div class="flex max-w-md flex-col gap-4">
		<label
			class="hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-500/10 dark:hover:bg-primary-500/10 grid aspect-video w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700"
		>
			<div class="flex flex-col gap-2 text-center text-neutral-500 dark:text-neutral-400">
				{#if files}
					{#each Array.from(files) as file}
						<p>{file.name}</p>
					{/each}
				{:else}
					<span class="grid place-items-center text-xl">
						<Icon icon="fa6-solid:cloud-arrow-up" />
					</span>
					<p class="text-sm">Drag and drop files here</p>
				{/if}
			</div>
			<input class="hidden" accept="video/*" type="file" bind:files />
		</label>

		<Button>Upload</Button>
	</div>
</div>
