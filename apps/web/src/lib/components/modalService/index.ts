import type { ButtonVariant } from '@repo/ui';
import { get, writable } from 'svelte/store';

export interface SimpleModal {
	title: string;
	contents: string;
	raw?: boolean;
	buttons?: {
		label: string;
		variant?: ButtonVariant;
		onClick?: (hide: () => void) => void | Promise<void>;
	}[];
	closable?: boolean;
}

const createModalStore = () => {
	const store = writable<Record<string, SimpleModal>>({});
	const { subscribe, update } = store;

	const create = (key: string, modal: SimpleModal) => {
		update((all) => ({ ...all, [key]: modal }));
	};

	const remove = (key: string) => {
		const { [key]: removed, ...rest } = get(store);
		update(() => rest);
	};

	return {
		subscribe,
		create,
		remove
	};
};

export const modals = createModalStore();
