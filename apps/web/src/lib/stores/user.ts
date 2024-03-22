import type { User } from '@repo/types';
import { writable } from 'svelte/store';

export const userStore = writable<User>(undefined);
