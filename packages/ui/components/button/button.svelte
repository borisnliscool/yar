<script lang="ts">
	import { cn } from '@repo/utils';
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { buttonVariants, type ButtonEvents, type ButtonProps } from '.';

	type $$Props = ButtonProps;
	//eslint-disable-next-line @typescript-eslint/no-unused-vars
	type $$Events = ButtonEvents;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let builders: $$Props['builders'] = [];
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
