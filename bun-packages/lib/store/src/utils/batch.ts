/**
 * Batch updates for @wpackages/store
 * Allows multiple state updates to be batched together
 */

import type { Store, MapStore } from "../types";

export interface BatchOptions<T> {
	debounceMs?: number;
	shouldBatch?: (newValue: T, oldValue: T) => boolean;
}

/**
 * Creates a store that batches updates
 * @param store The store to batch
 * @param options Batch options
 * @returns A store with batched updates
 */
export function withBatch<T>(
	store: Store<T>,
	options: BatchOptions<T> = {},
): Store<T> & {
	batch: (updater: (value: T) => T) => void;
	flush: () => void;
} {
	const { debounceMs, shouldBatch } = options;
	let pendingValue: T | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const flush = () => {
		if (pendingValue !== null) {
			store.set(pendingValue);
			pendingValue = null;
		}
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	const batchedStore: Store<T> & {
		batch: (updater: (value: T) => T) => void;
		flush: () => void;
	} = {
		get: store.get.bind(store),
		set: (value: T) => {
			const oldValue = store.get();

			if (shouldBatch && !shouldBatch(value, oldValue)) {
				store.set(value);
				return;
			}

			pendingValue = value;

			if (debounceMs) {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				timeoutId = setTimeout(flush, debounceMs);
			} else {
				flush();
			}
		},
		subscribe: store.subscribe.bind(store),
		batch: (updater: (value: T) => T) => {
			const current = store.get();
			const next = updater(current);
			batchedStore.set(next);
		},
		flush,
	};

	return batchedStore;
}

/**
 * Creates a map store that batches updates
 * @param store The map store to batch
 * @param options Batch options
 * @returns A map store with batched updates
 */
export function withMapBatch<T extends object>(
	store: MapStore<T>,
	options: BatchOptions<T> = {},
): MapStore<T> & {
	batch: (updater: (value: T) => T) => void;
	flush: () => void;
} {
	const { debounceMs, shouldBatch } = options;
	let pendingValue: T | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const flush = () => {
		if (pendingValue !== null) {
			store.set(pendingValue);
			pendingValue = null;
		}
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	const batchedStore: MapStore<T> & {
		batch: (updater: (value: T) => T) => void;
		flush: () => void;
	} = {
		get: store.get.bind(store),
		set: (value: T) => {
			const oldValue = store.get();

			if (shouldBatch && !shouldBatch(value, oldValue)) {
				store.set(value);
				return;
			}

			pendingValue = value;

			if (debounceMs) {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				timeoutId = setTimeout(flush, debounceMs);
			} else {
				flush();
			}
		},
		setKey: store.setKey.bind(store),
		subscribe: store.subscribe.bind(store),
		batch: (updater: (value: T) => T) => {
			const current = store.get();
			const next = updater(current);
			batchedStore.set(next);
		},
		flush,
	};

	return batchedStore;
}

/**
 * Runs multiple updates in a batch
 * @param store The store to update
 * @param updates Array of update functions
 */
export function batchUpdates<T>(store: Store<T>, updates: Array<(value: T) => T>): void {
	const current = store.get();
	let result = current;
	for (const update of updates) {
		result = update(result);
	}
	store.set(result);
}

/**
 * Runs multiple key updates in a batch for map stores
 * @param store The map store to update
 * @param updates Object of key-value pairs to update
 */
export function batchMapUpdates<T extends object>(store: MapStore<T>, updates: Partial<T>): void {
	const current = store.get();
	const next = { ...current, ...updates };
	store.set(next);
}
