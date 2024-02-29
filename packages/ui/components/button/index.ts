import type { Button as ButtonPrimitive } from 'bits-ui';
import { tv, type VariantProps } from 'tailwind-variants';
import Root from './button.svelte';

const buttonVariants = tv({
	base: 'focus-visible:ring-opacity-50 dark:focus-visible:ring-primary-500/50 flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
	variants: {
		variant: {
			default:
				'bg-primary-500 active:bg-primary-500 hover:bg-primary-500/90 text-white ring-primary-500',
			secondary:
				'bg-secondary-500 active:bg-secondary-500 hover:bg-secondary-500/90 text-white ring-secondary-500',
			success:
				'bg-green-500 active:bg-green-500 hover:bg-green-500/90 text-white ring-green-500',
			destructive: 'bg-red-500 active:bg-red-500 hover:bg-red-500/90 text-white ring-red-500',
			outline: 'border',
			link: 'text-primary-500 underline-offset-4 hover:underline',
			ghost: '',
		},
		size: {
			default: 'h-10 px-3 py-2 text-sm',
			sm: 'h-9 rounded-md px-3 text-xs',
			lg: 'h-11 rounded-md px-6 text-base',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
	},
});

type Variant = VariantProps<typeof buttonVariants>['variant'];
type Size = VariantProps<typeof buttonVariants>['size'];

type Props = ButtonPrimitive.Props & {
	variant?: Variant;
	size?: Size;
};

type Events = ButtonPrimitive.Events;

export { Root as Button, buttonVariants, type Events as ButtonEvents, type Props as ButtonProps };
