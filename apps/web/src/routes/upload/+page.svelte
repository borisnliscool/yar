<script lang="ts">
	import { Button, Input } from '@repo/ui';

	let input = '';

	const search = () => {
		console.log('search');
	};
</script>

<div class="mx-auto w-full max-w-2xl py-4">
	<p>Testing</p>
	<Input bind:value={input} on:paste={search} />

	<div class="mt-2 flex flex-wrap items-center gap-1">
		<Button>Hello world</Button>
		<Button variant="secondary">Hello world</Button>
		<Button variant="success">Hello world</Button>
		<Button variant="destructive">Hello world</Button>
		<Button variant="link">Hello world</Button>
		<Button variant="ghost">Hello world</Button>
		<Button variant="outline">Hello world</Button>
	</div>

	<div class="mt-2 flex flex-wrap items-center gap-1">
		<Button size="sm">Hello world</Button>
		<Button size="default">Hello world</Button>
		<Button size="lg">Hello world</Button>
	</div>
</div>
