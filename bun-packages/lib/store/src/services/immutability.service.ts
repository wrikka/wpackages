/**
 * Immutability enforcement for @wpackages/store
 * Utilities and middleware for enforcing immutability
 */

import type { Store, MapStore } from "../types";

/**
 * Deep freezes an object
 * @param obj The object to freeze
 * @returns The frozen object
 */
export function deepFreeze<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	Object.freeze(obj);

	for (const key of Object.keys(obj)) {
		const value = (obj as Record<string, unknown>)[key];
		if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
			deepFreeze(value);
		}
	}

	return obj;
}

/**
 * Shallow equality check
 * @param a First value
 * @param b Second value
 * @returns True if values are shallowly equal
 */
export function shallowEqual<T>(a: T, b: T): boolean {
	if (a === b) {
		return true;
	}

	if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (const key of keysA) {
		if (!Object.prototype.hasOwnProperty.call(b, key) || (a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) {
			return false;
		}
	}

	return true;
}

/**
 * Deep equality check
 * @param a First value
 * @param b Second value
 * @returns True if values are deeply equal
 */
export function deepEqual<T>(a: T, b: T): boolean {
	if (a === b) {
		return true;
	}

	if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (const key of keysA) {
		if (!Object.prototype.hasOwnProperty.call(b, key)) {
			return false;
		}

		const valueA = (a as Record<string, unknown>)[key];
		const valueB = (b as Record<string, unknown>)[key];

		if (!deepEqual(valueA, valueB)) {
			return false;
		}
	}

	return true;
}

/**
 * Creates a middleware that freezes state after updates
 * @returns Middleware function
 */
export function freezeMiddleware<T>() {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const originalSet = context.setState;

		return {
			...context,
			setState: (value: T) => {
				originalSet(deepFreeze(value) as T);
			},
		};
	};
}

/**
 * Creates a middleware that enforces immutability using Proxy
 * @returns Middleware function
 */
export function immutableMiddleware<T extends object>() {
	return (context: { getState: () => T; setState: (value: T) => void }) => {
		const originalSet = context.setState;

		const createImmutableProxy = (obj: T): T => {
			return new Proxy(obj, {
				set(_target, prop, _value) {
					throw new Error(`Cannot set property '${String(prop)}' on immutable state`);
				},
				deleteProperty(_target, prop) {
					throw new Error(`Cannot delete property '${String(prop)}' on immutable state`);
				},
				defineProperty(_target, prop, _descriptor) {
					throw new Error(`Cannot define property '${String(prop)}' on immutable state`);
				},
			}) as T;
		};

		return {
			...context,
			setState: (value: T) => {
				originalSet(createImmutableProxy(value));
			},
		};
	};
}

/**
 * Creates a store with frozen state
 * @param store The store to enhance
 * @returns A store with frozen state
 */
export function withFrozenState<T>(
	store: Store<T>,
): Store<T> {
	const frozenStore: Store<T> = {
		get: () => {
			return deepFreeze(store.get());
		},
		set: (value: T) => {
			store.set(deepFreeze(value) as T);
		},
		subscribe: store.subscribe.bind(store),
	};

	return frozenStore;
}

/**
 * Creates a map store with frozen state
 * @param store The map store to enhance
 * @returns A map store with frozen state
 */
export function withFrozenMapState<T extends object>(
	store: MapStore<T>,
): MapStore<T> {
	const frozenStore: MapStore<T> = {
		get: () => {
			return deepFreeze(store.get());
		},
		set: (value: T) => {
			store.set(deepFreeze(value) as T);
		},
		setKey: (key, value) => {
			const current = store.get();
			const next = { ...current, [key]: deepFreeze(value) };
			store.set(next as T);
		},
		subscribe: store.subscribe.bind(store),
	};

	return frozenStore;
}
