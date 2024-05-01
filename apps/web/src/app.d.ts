// See https://kit.svelte.dev/docs/types#app

import type { User } from '@repo/types';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User;
		}
		// interface PageData {}
		// interface Platform {}
	}

	namespace svelteHTML {
		interface HTMLAttributes<T> {
			'on:intersection'?: (event: CustomEvent) => void;
		}
	}
}

export {};
