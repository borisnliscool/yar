export class Cache<T, TKey = string> {
	private cache: Map<TKey, T> = new Map();

	get(key: TKey) {
		return this.cache.get(key);
	}

	getAll() {
		return this.cache;
	}

	set(data: Map<TKey, T>): void;
	set(data: TKey, value: T): void;
	set(data: TKey | Map<TKey, T>, value?: T) {
		if (value) {
			this.cache.set(data as TKey, value);
		} else {
			this.cache.set(data as TKey, data as T);
		}
	}

	delete(key: TKey) {
		this.cache.delete(key);
	}

	clear() {
		this.cache.clear();
	}
}
