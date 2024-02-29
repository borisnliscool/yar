<script lang="ts">
	import API from '$lib/api';
	import type { YtdlpVideo } from '@repo/types';
	import { Button, Input } from '@repo/ui';
	import { instant } from '@repo/utils';

	let videoInfo: Promise<YtdlpVideo>;
	let input = '';

	const search = instant(async () => {
		const url = new URL(input);

		videoInfo = new Promise(async (resolve, reject) => {
			try {
				const response = await API.post('/upload/info', {
					url: url
				});

				resolve(await response.json());
			} catch (error) {
				reject(error);
			}
		});
	});
</script>

<div class="mx-auto w-full max-w-2xl py-4">
	<div class="flex items-center gap-2">
		<Input placeholder="Video URL" bind:value={input} on:paste={search} />
		<Button on:click={search}>Search</Button>
	</div>

	{#await videoInfo}
		loading..
	{:then data}
		<pre>{JSON.stringify(data, null, 4)}</pre>
	{:catch error}
		failed! {error}
	{/await}
</div>
