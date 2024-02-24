<script lang="ts">
	import Icon from '@iconify/svelte';

	let count = 0;

	function handleClick() {
		count += 1;
	}
</script>

<Icon icon="fa6-solid:house" />
<button class="bg-red-500" on:click={handleClick}>
	clicks: {count}
</button>
