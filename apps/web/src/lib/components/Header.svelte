<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import Icon from '@iconify/svelte';
	import { Input } from '@repo/ui';
</script>

<header
	class="sticky top-0 grid h-16 max-h-16 min-h-16 w-full grid-cols-5 place-items-center border-b bg-white/95 px-8 shadow-lg backdrop-blur-lg dark:border-b-neutral-700 dark:bg-neutral-800/95"
>
	<div class="w-full text-xl font-black">
		<a href="/">YAR</a>
	</div>

	<div class="col-span-3 w-full min-w-[20rem] max-w-[30rem]">
		<Input type="search" class="w-full rounded-full px-4" placeholder="Search query" />
	</div>

	<div class="flex w-full items-center justify-end gap-6">
		<button on:click={() => ($theme = $theme == 'dark' ? 'light' : 'dark')} class="text-xl">
			{#if $theme == 'dark'}
				<Icon icon="fa6-solid:sun" />
			{:else}
				<Icon icon="fa6-solid:moon" />
			{/if}
		</button>
		<a href="/upload" class="grid aspect-square h-10 place-items-center text-2xl">
			<Icon icon="ri:video-upload-line" />
		</a>
		<img class="h-8" src="https://api.dicebear.com/6.x/identicon/svg?seed=123" alt="profile" />
	</div>
</header>
