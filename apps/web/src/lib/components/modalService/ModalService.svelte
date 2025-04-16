<script lang="ts">
	import { Button, Modal } from '@repo/ui';
	import { cn } from '@repo/utils';
	import { modals } from '.';
</script>

{#each Object.entries($modals) as [key, modal] (key)}
	<Modal
		title={modal.title}
		closable={modal.closable}
		shown={true}
		on:close={() => modals.remove(key)}
	>
		<svelte:fragment slot="trigger" />

		{#if modal.raw}
			<!--eslint-disable-next-line svelte/no-at-html-tags-->
			{@html modal.contents}
		{:else}
			<p class="text-sm text-neutral-700 dark:text-neutral-400">{modal.contents}</p>
		{/if}

		<svelte:fragment slot="footer" let:hideModal>
			<hr class="border-t dark:border-neutral-800" />

			<div class="flex w-full items-center justify-end gap-2">
				{#if modal.buttons}
					{#each modal.buttons as button (button.label)}
						<Button
							variant={button.variant ?? 'default'}
							class={cn(
								'h-fit px-4 py-2',
								button.variant === 'outline' && 'dark:border-neutral-700'
							)}
							size="sm"
							on:click={() => {
								if (!button.onClick) modals.remove(key);
								else button.onClick(() => modals.remove(key));
							}}
						>
							{button.label}
						</Button>
					{/each}
				{:else}
					<Button
						variant="outline"
						class="h-fit px-4 py-2 dark:border-neutral-700"
						size="sm"
						on:click={() => hideModal()}
					>
						Close
					</Button>
				{/if}
			</div>
		</svelte:fragment>
	</Modal>
{/each}
