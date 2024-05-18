<script lang="ts">
	import {
		createPopperLite as createPopper,
		type Instance,
		type Modifier,
		type OptionsGeneric,
	} from '@popperjs/core';
	import { cn } from '@repo/utils';
	import { merge } from 'lodash-es';
	import { onMount } from 'svelte';

	let tooltip: HTMLDivElement;
	let className = '';
	let instance: Instance;

	export { className as class };
	export let options: Partial<OptionsGeneric<Partial<Modifier<unknown, unknown>>>> | undefined =
		undefined;

	const showEvent = () => {
		tooltip.setAttribute('data-show', '');
		instance.setOptions((options) =>
			merge(options, { modifiers: [{ name: 'eventListeners', enabled: true }] })
		);
	};

	const hideEvent = () => {
		tooltip.removeAttribute('data-show');
		instance.setOptions((options) =>
			merge(options, { modifiers: [{ name: 'eventListeners', enabled: false }] })
		);
	};

	onMount(() => {
		const target = tooltip.previousElementSibling;

		instance = createPopper(
			target,
			tooltip,
			merge(
				{
					placement: 'top',
				},
				options
			)
		);

		target.addEventListener('mouseenter', showEvent);
		target.addEventListener('focus', showEvent);
		target.addEventListener('mouseleave', hideEvent);
		target.addEventListener('blur', hideEvent);

		return () => {
			target.removeEventListener('mouseenter', showEvent);
			target.removeEventListener('focus', showEvent);
			target.removeEventListener('mouseleave', hideEvent);
			target.removeEventListener('blur', hideEvent);
		};
	});
</script>

<div
	class={cn(
		'bg-white shadow px-3 py-2 rounded-md text-black dark:text-white dark:bg-neutral-950 invisible data-[show]:visible z-50',
		className
	)}
	role="tooltip"
	bind:this={tooltip}
>
	<slot />
</div>
