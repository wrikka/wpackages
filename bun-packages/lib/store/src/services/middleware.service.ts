/**
 * Middleware types and utilities for @wpackages/store
 */

import type { Store, MapStore, Listener } from "../types";

export interface MiddlewareContext<T> {
	store: Store<T> | MapStore<T>;
	getState: () => T;
	setState: (value: T) => void;
	subscribe: (listener: Listener<T>) => () => void;
}

export type Middleware<T> = (context: MiddlewareContext<T>) => MiddlewareContext<T>;

export interface StoreWithMiddleware<T> extends Store<T> {
	use: (...middlewares: Middleware<T>[]) => StoreWithMiddleware<T>;
}

export interface MapStoreWithMiddleware<T extends object> extends MapStore<T> {
	use: (...middlewares: Middleware<T>[]) => MapStoreWithMiddleware<T>;
}

/**
 * Apply middleware to a store
 * @param store The store to apply middleware to
 * @param middlewares Array of middleware functions
 * @returns A new store with middleware applied
 */
export function applyMiddleware<T>(
	store: Store<T>,
	...middlewares: Middleware<T>[]
): StoreWithMiddleware<T> {
	const enhancedStore: StoreWithMiddleware<T> = {
		get: store.get.bind(store),
		set: store.set.bind(store),
		subscribe: store.subscribe.bind(store),
		use: (...newMiddlewares) => applyMiddleware(store, ...middlewares, ...newMiddlewares),
	};

	let context: MiddlewareContext<T> = {
		store: enhancedStore,
		getState: store.get.bind(store),
		setState: store.set.bind(store),
		subscribe: store.subscribe.bind(store),
	};

	for (const middleware of middlewares) {
		context = middleware(context);
	}

	enhancedStore.get = context.getState;
	enhancedStore.set = context.setState;
	enhancedStore.subscribe = context.subscribe;

	return enhancedStore;
}

/**
 * Apply middleware to a map store
 * @param store The map store to apply middleware to
 * @param middlewares Array of middleware functions
 * @returns A new map store with middleware applied
 */
export function applyMapMiddleware<T extends object>(
	store: MapStore<T>,
	...middlewares: Middleware<T>[]
): MapStoreWithMiddleware<T> {
	const enhancedStore: MapStoreWithMiddleware<T> = {
		get: store.get.bind(store),
		set: store.set.bind(store),
		setKey: store.setKey.bind(store),
		subscribe: store.subscribe.bind(store),
		use: (...newMiddlewares) => applyMapMiddleware(store, ...middlewares, ...newMiddlewares),
	};

	let context: MiddlewareContext<T> = {
		store: enhancedStore,
		getState: store.get.bind(store),
		setState: store.set.bind(store),
		subscribe: store.subscribe.bind(store),
	};

	for (const middleware of middlewares) {
		context = middleware(context);
	}

	enhancedStore.get = context.getState;
	enhancedStore.set = context.setState;
	enhancedStore.subscribe = context.subscribe;

	return enhancedStore;
}

/**
 * Logger middleware - logs all state changes
 */
export function loggerMiddleware<T>(name = "Store"): Middleware<T> {
	return (context) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value) => {
				const oldValue = context.getState();
				console.log(`[${name}] State change:`, { oldValue, newValue: value });
				originalSet(value);
			},
		};
	};
}

/**
 * Throttle middleware - throttles state updates
 */
export function throttleMiddleware<T>(ms: number): Middleware<T> {
	return (context) => {
		const originalSet = context.setState;
		let lastUpdate = 0;
		let pendingValue: T | null = null;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		return {
			...context,
			setState: (value) => {
				const now = Date.now();
				const timeSinceLastUpdate = now - lastUpdate;

				if (timeSinceLastUpdate >= ms) {
					lastUpdate = now;
					originalSet(value);
					pendingValue = null;
				} else {
					pendingValue = value;
					if (timeoutId) {
						clearTimeout(timeoutId);
					}
					timeoutId = setTimeout(() => {
						if (pendingValue !== null) {
							lastUpdate = Date.now();
							originalSet(pendingValue);
							pendingValue = null;
						}
					}, ms - timeSinceLastUpdate);
				}
			},
		};
	};
}

/**
 * Debounce middleware - debounces state updates
 */
export function debounceMiddleware<T>(ms: number): Middleware<T> {
	return (context) => {
		const originalSet = context.setState;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let pendingValue: T | null = null;

		return {
			...context,
			setState: (value) => {
				pendingValue = value;
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
				timeoutId = setTimeout(() => {
					if (pendingValue !== null) {
						originalSet(pendingValue);
						pendingValue = null;
					}
				}, ms);
			},
		};
	};
}
