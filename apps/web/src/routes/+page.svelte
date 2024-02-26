<script lang="ts">
	import Header from '$components/Header.svelte';
	import { theme } from '$lib/stores/theme';
	import { MyCounterButton } from '@repo/ui';
</script>

<Header />

<h1>Youtube Archive - Web</h1>

<MyCounterButton />

<button on:click={() => ($theme = $theme == 'dark' ? 'light' : 'dark')}> toggle theme </button>
