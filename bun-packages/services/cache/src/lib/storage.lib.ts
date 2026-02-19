/**
 * Third-party library wrappers
 */

/**
 * Wrapper for localStorage with caching functionality
 */
export const createLocalStorageCache = <T>(key: string) => {
	const storage: Storage | undefined = typeof localStorage === "undefined"
		? undefined
		: (localStorage as unknown as Storage);

	return {
		get: (): T | null => {
			if (!storage) {
				return null;
			}
			try {
				const item = storage.getItem(key);
				return item ? JSON.parse(item) : null;
			} catch {
				return null;
			}
		},
		set: (value: T): void => {
			if (!storage) {
				return;
			}
			try {
				storage.setItem(key, JSON.stringify(value));
			} catch {
				return;
			}
		},
		remove: (): void => {
			if (!storage) {
				return;
			}
			storage.removeItem(key);
		},
	};
};

/**
 * Wrapper for sessionStorage with caching functionality
 */
export const createSessionStorageCache = <T>(key: string) => {
	const storage: Storage | undefined = typeof sessionStorage === "undefined"
		? undefined
		: (sessionStorage as unknown as Storage);

	return {
		get: (): T | null => {
			if (!storage) {
				return null;
			}
			try {
				const item = storage.getItem(key);
				return item ? JSON.parse(item) : null;
			} catch {
				return null;
			}
		},
		set: (value: T): void => {
			if (!storage) {
				return;
			}
			try {
				storage.setItem(key, JSON.stringify(value));
			} catch {
				return;
			}
		},
		remove: (): void => {
			if (!storage) {
				return;
			}
			storage.removeItem(key);
		},
	};
};
