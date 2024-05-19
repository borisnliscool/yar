<script lang="ts">
	import { cn } from '@repo/utils';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Button } from '../button';

	export let shown = false;
	export let closable = true;
	export let title = '';

	const dispatcher = createEventDispatcher();

	let dialog: HTMLDialogElement;

	$: if (dialog && shown) {
		dialog.showModal();
		dialog.scrollTo({
			top: 0,
			behavior: 'instant',
		});
	}

	$: if (!shown) dispatcher('close');
</script>

<slot name="trigger" showModal={() => (shown = true)} />

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close
	on:close={() => (shown = false)}
	on:mousedown|self={() => closable && dialog.close()}
	class="bg-transparent w-full open:backdrop:bg-black/50 backdrop:bg-black/0 transition-all"
>
	{#if shown}
		<div
			transition:fade={{ duration: 200 }}
			class={cn(
				'w-full max-w-md mx-auto p-4 border dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-md dark:text-white flex flex-col gap-4 shadow-md',
				$$props.class
			)}
		>
			{#if title}
				<h1 class="text-xl font-bold">{title}</h1>
			{/if}

			<slot>
				<p>
					Lorem, ipsum dolor sit amet consectetur adipisicing elit. Id nam minus obcaecati
					sunt aliquam consequatur quod eligendi. Non, expedita. Totam eum non incidunt
					obcaecati, architecto voluptate possimus laudantium ex quisquam illo facilis
					laboriosam at unde hic similique. Quaerat consequuntur sit ducimus nisi quasi
					enim quibusdam, totam necessitatibus quod sint voluptatum.
				</p>
			</slot>

			<slot name="footer" hideModal={() => dialog.close()}>
				<hr class="border-t dark:border-neutral-800" />
				<div class="w-full flex items-center justify-end">
					<Button
						variant="outline"
						class="px-4 h-fit py-2 dark:border-neutral-700"
						size="sm"
						on:click={() => dialog.close()}
					>
						Close
					</Button>
				</div>
			</slot>
		</div>
	{/if}
</dialog>
