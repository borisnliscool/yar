<script lang="ts">
	import { notifications } from '.';
	import Notification from './Notification.svelte';
</script>

{#if $notifications}
	<section class="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-1">
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
