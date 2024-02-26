<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { MyCounterButton } from '@repo/ui';
</script>

<h1>Youtube Archive - Web</h1>

<MyCounterButton />

<button on:click={() => ($theme = $theme == 'dark' ? 'light' : 'dark')}> toggle theme </button>
