/**
 * Persistence middleware for @wpackages/store
 * Persists store state to localStorage or sessionStorage
 */

import type { Store, MapStore, Listener } from "../types";

export interface PersistenceConfig<T> {
	key: string;
	storage?: "localStorage" | "sessionStorage";
	serializer?: (value: T) => string;
	deserializer?: (value: string) => T;
}

const getStorage = (type: "localStorage" | "sessionStorage") => {
	if (typeof window === "undefined") return null;
	return window[type];
};

/**
 * Creates a persistence middleware for stores
 * @param config Persistence configuration
 * @returns Middleware function
 */
export function createPersistenceMiddleware<T>(config: PersistenceConfig<T>) {
	const { key, storage = "localStorage", serializer, deserializer } = config;

	const storageObj = getStorage(storage);
	if (!storageObj) {
		return (context: { getState: () => T; setState: (value: T) => void }) => context;
	}

	return (context: { getState: () => T; setState: (value: T) => void; subscribe: (listener: Listener<T>) => () => void }) => {
		const serialize = serializer || JSON.stringify;
		const deserialize = deserializer || JSON.parse;

		const saveState = (value: T) => {
			try {
				storageObj.setItem(key, serialize(value));
			} catch {
				// Ignore errors
			}
		};

		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				originalSet(value);
				saveState(value);
			},
			subscribe: (listener: Listener<T>) => {
				const unsubscribe = context.subscribe(listener);

				const handleStorageChange = (e: StorageEvent) => {
					if (e.key === key && e.newValue !== null) {
						try {
							const newValue = deserialize(e.newValue);
							originalSet(newValue);
						} catch {
							// Ignore errors
						}
					}
				};

				window.addEventListener("storage", handleStorageChange);

				return () => {
					unsubscribe();
					window.removeEventListener("storage", handleStorageChange);
				};
			},
		};
	};
}

/**
 * Hydrates a store with persisted state
 * @param store The store to hydrate
 * @param config Persistence configuration
 * @returns The store with persistence enabled
 */
export function withPersistence<T>(
	store: Store<T>,
	config: PersistenceConfig<T>,
): Store<T> {
	const middleware = createPersistenceMiddleware(config);
	const enhanced = middleware({
		getState: store.get.bind(store),
		setState: store.set.bind(store),
		subscribe: store.subscribe.bind(store),
	});

	const persistedState = (() => {
		const { key, storage = "localStorage", deserializer } = config;
		const storageObj = getStorage(storage);
		if (!storageObj) return null;

		try {
			const stored = storageObj.getItem(key);
			if (stored) {
				return (deserializer || JSON.parse)(stored);
			}
		} catch {
			// Ignore errors
		}
		return null;
	})();

	if (persistedState !== null) {
		store.set(persistedState);
	}

	return {
		get: enhanced.getState,
		set: enhanced.setState,
		subscribe: enhanced.subscribe,
	};
}

/**
 * Hydrates a map store with persisted state
 * @param store The map store to hydrate
 * @param config Persistence configuration
 * @returns The map store with persistence enabled
 */
export function withMapPersistence<T extends object>(
	store: MapStore<T>,
	config: PersistenceConfig<T>,
): MapStore<T> {
	const middleware = createPersistenceMiddleware(config);
	const enhanced = middleware({
		getState: store.get.bind(store),
		setState: store.set.bind(store),
		subscribe: store.subscribe.bind(store),
	});

	const persistedState = (() => {
		const { key, storage = "localStorage", deserializer } = config;
		const storageObj = getStorage(storage);
		if (!storageObj) return null;

		try {
			const stored = storageObj.getItem(key);
			if (stored) {
				return (deserializer || JSON.parse)(stored);
			}
		} catch {
			// Ignore errors
		}
		return null;
	})();

	if (persistedState !== null) {
		store.set(persistedState);
	}

	return {
		get: enhanced.getState,
		set: enhanced.setState,
		setKey: store.setKey.bind(store),
		subscribe: enhanced.subscribe,
	};
}

/**
 * Clears persisted state for a given key
 * @param key The storage key
 * @param storage The storage type
 */
export function clearPersistence(key: string, storage: "localStorage" | "sessionStorage" = "localStorage") {
	const storageObj = getStorage(storage);
	if (storageObj) {
		storageObj.removeItem(key);
	}
}
