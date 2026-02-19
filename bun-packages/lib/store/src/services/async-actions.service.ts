/**
 * Async actions support for @wpackages/store
 */

import type { Store, MapStore } from "../types";

export interface AsyncAction<T, Args extends unknown[] = []> {
	(...args: Args): Promise<T>;
}

export interface AsyncActionOptions<T> {
	onStart?: () => void;
	onSuccess?: (result: T) => void;
	onError?: (error: Error) => void;
	onFinally?: () => void;
}

export interface AsyncState<T> {
	data: T | null;
	loading: boolean;
	error: Error | null;
}

/**
 * Creates an async action that updates the store
 * @param store The store to update
 * @param action The async action function
 * @param options Action lifecycle callbacks
 * @returns An async action function
 */
export function createAsyncAction<T, Args extends unknown[] = []>(
	store: Store<AsyncState<T>>,
	action: (...args: Args) => Promise<T>,
	options?: AsyncActionOptions<T>,
): AsyncAction<T, Args> {
	return async (...args: Args) => {
		try {
			options?.onStart?.();
			store.set({ data: null, loading: true, error: null });

			const result = await action(...args);

			store.set({ data: result, loading: false, error: null });
			options?.onSuccess?.(result);
			return result;
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			store.set({ data: null, loading: false, error: err });
			options?.onError?.(err);
			throw err;
		} finally {
			options?.onFinally?.();
		}
	};
}

/**
 * Creates an async action for a map store
 * @param store The map store to update
 * @param key The key to update in the store
 * @param action The async action function
 * @param options Action lifecycle callbacks
 * @returns An async action function
 */
export function createMapAsyncAction<T extends object, K extends keyof T, Args extends unknown[] = []>(
	store: MapStore<T>,
	key: K,
	action: (...args: Args) => Promise<T[K]>,
	options?: AsyncActionOptions<T[K]>,
): AsyncAction<T[K], Args> {
	return async (...args: Args) => {
		try {
			options?.onStart?.();
			store.setKey(key, null as T[K]);

			const result = await action(...args);

			store.setKey(key, result);
			options?.onSuccess?.(result);
			return result;
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			options?.onError?.(err);
			throw err;
		} finally {
			options?.onFinally?.();
		}
	};
}

/**
 * Creates an initial async state
 * @returns An initial async state
 */
export function createInitialAsyncState<T>(): AsyncState<T> {
	return {
		data: null,
		loading: false,
		error: null,
	};
}

/**
 * Creates an async state with initial data
 * @param data The initial data
 * @returns An async state with the data
 */
export function createAsyncStateWithData<T>(data: T): AsyncState<T> {
	return {
		data,
		loading: false,
		error: null,
	};
}

/**
 * Batch multiple async actions
 * @param actions Array of async actions
 * @returns Promise that resolves when all actions complete
 */
export async function batchAsyncActions<T>(actions: Array<() => Promise<T>>): Promise<T[]> {
	return Promise.all(actions.map((action) => action()));
}

/**
 * Sequence multiple async actions
 * @param actions Array of async actions
 * @returns Promise that resolves when all actions complete in sequence
 */
export async function sequenceAsyncActions<T>(actions: Array<() => Promise<T>>): Promise<T[]> {
	const results: T[] = [];
	for (const action of actions) {
		const result = await action();
		results.push(result);
	}
	return results;
}

/**
 * Creates a debounced async action
 * @param action The async action to debounce
 * @param ms Debounce delay in milliseconds
 * @returns A debounced async action
 */
export function debounceAsyncAction<T, Args extends unknown[] = []>(
	action: (...args: Args) => Promise<T>,
	ms: number,
): (...args: Args) => Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Args) => {
		return new Promise((resolve, reject) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(async () => {
				try {
					const result = await action(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			}, ms);
		});
	};
}

/**
 * Creates a throttled async action
 * @param action The async action to throttle
 * @param ms Throttle delay in milliseconds
 * @returns A throttled async action
 */
export function throttleAsyncAction<T, Args extends unknown[] = []>(
	action: (...args: Args) => Promise<T>,
	ms: number,
): (...args: Args) => Promise<T> {
	let lastCall = 0;
	let pendingPromise: Promise<T> | null = null;

	return (...args: Args) => {
		const now = Date.now();
		const timeSinceLastCall = now - lastCall;

		if (timeSinceLastCall >= ms) {
			lastCall = now;
			return action(...args);
		}

		if (!pendingPromise) {
			pendingPromise = new Promise((resolve, reject) => {
				setTimeout(async () => {
					try {
						const result = await action(...args);
						resolve(result);
					} catch (error) {
						reject(error);
					} finally {
						pendingPromise = null;
					}
				}, ms - timeSinceLastCall);
			});
		}

		return pendingPromise;
	};
}
