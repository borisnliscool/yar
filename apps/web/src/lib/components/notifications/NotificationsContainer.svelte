<script lang="ts">
	import { notifications } from '.';
	import Notification from './Notification.svelte';
</script>

{#if $notifications}
	<section class="fixed bottom-0 right-0 z-[1000] flex flex-col items-end gap-1 p-4">
		{#each $notifications as toast (toast.id)}
			<Notification
				type={toast.type}
				dismissible={toast.dismissible}
				on:dismiss={() => notifications.dismiss(toast.id)}
			>
				{toast.message}
			</Notification>
		{/each}
	</section>
{/if}
