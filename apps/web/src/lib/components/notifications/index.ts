import { writable } from 'svelte/store';

export interface Notification {
	id: string;
	message: string;
	type?: NotificationType;
	dismissible?: boolean;
	timeout?: number;
}

export type NotificationType = 'info' | 'success' | 'error';

const createStore = () => {
	const { subscribe, update } = writable<Notification[]>([]);

	const dismiss = (id: string) => {
		update((all) => all.filter((t) => t.id !== id));
	};

	const add = (notification: Omit<Notification, 'id'>) => {
		const id = crypto.randomUUID();

		const defaults: Notification = {
			id,
			type: 'info',
			dismissible: true,
			timeout: 10_000,
			message: ''
		};

		const finalNotification = { ...defaults, ...notification };
		update((all) => [finalNotification, ...all]);

		if (finalNotification.timeout) setTimeout(() => dismiss(id), finalNotification.timeout);
	};

	const info = (message: string) => add({ message, type: 'info' });
	const success = (message: string) => add({ message, type: 'success' });
	const error = (message: string) => add({ message, type: 'error' });

	return {
		subscribe,
		add,
		dismiss,
		info,
		success,
		error
	};
};

export const notifications = createStore();
