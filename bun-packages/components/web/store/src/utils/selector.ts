/**
 * Selector utilities for @wpackages/store
 * Optimized selectors with memoization
 */

import type { Store, MapStore, Listener } from "../types";

const selectorCache = new WeakMap<object, Map<string, unknown>>();

/**
 * Creates a memoized selector
 * @param selector The selector function
 * @param key Optional cache key
 * @returns A memoized selector function
 */
export function createSelector<T, R>(selector: (value: T) => R, key?: string): (value: T) => R {
	return (value: T) => {
		if (key && typeof value === "object" && value !== null) {
			const cacheKey = `${key}-${JSON.stringify(value)}`;
			const cache = selectorCache.get(value) || new Map();
			selectorCache.set(value, cache);

			if (cache.has(cacheKey)) {
				return cache.get(cacheKey) as R;
			}

			const result = selector(value);
			cache.set(cacheKey, result);
			return result;
		}

		return selector(value);
	};
}

/**
 * Creates a selector that only notifies when the selected value changes
 * @param store The store to subscribe to
 * @param selector The selector function
 * @returns A store-like object with the selected value
 */
export function selectFromStore<T, R>(
	store: Store<T>,
	selector: (value: T) => R,
): Store<R> {
	let lastValue: R | undefined;
	let lastSelectedValue: R | undefined;

	return {
		get: () => {
			const value = store.get();
			const selectedValue = selector(value);
			return selectedValue;
		},
		set: () => {
			throw new Error("Cannot set a read-only selector store");
		},
		subscribe: (listener: Listener<R>) => {
			return store.subscribe((value) => {
				const selectedValue = selector(value);
				if (selectedValue !== lastSelectedValue) {
					lastSelectedValue = selectedValue;
					listener(selectedValue, lastValue);
					lastValue = selectedValue;
				}
			});
		},
	};
}

/**
 * Creates a selector from a map store
 * @param store The map store to subscribe to
 * @param selector The selector function
 * @returns A store-like object with the selected value
 */
export function selectFromMapStore<T extends object, R>(
	store: MapStore<T>,
	selector: (value: T) => R,
): Store<R> {
	let lastValue: R | undefined;
	let lastSelectedValue: R | undefined;

	return {
		get: () => {
			const value = store.get();
			const selectedValue = selector(value);
			return selectedValue;
		},
		set: () => {
			throw new Error("Cannot set a read-only selector store");
		},
		subscribe: (listener: Listener<R>) => {
			return store.subscribe((value) => {
				const selectedValue = selector(value);
				if (selectedValue !== lastSelectedValue) {
					lastSelectedValue = selectedValue;
					listener(selectedValue, lastValue);
					lastValue = selectedValue;
				}
			});
		},
	};
}

/**
 * Creates a shallow equality selector
 * @param selector The selector function
 * @returns A selector that uses shallow equality
 */
export function createShallowSelector<T extends object, R>(
	selector: (value: T) => R,
): (value: T) => R {
	let lastValue: T | undefined;
	let lastResult: R | undefined;

	return (value: T) => {
		if (lastValue === value) {
			return lastResult as R;
		}

		if (
			lastValue &&
			typeof lastValue === "object" &&
			typeof value === "object" &&
			!Array.isArray(lastValue) &&
			!Array.isArray(value)
		) {
			const keys1 = Object.keys(lastValue);
			const keys2 = Object.keys(value);

			if (keys1.length === keys2.length && keys1.every((key) => key in value && (lastValue as Record<string, unknown>)[key] === (value as Record<string, unknown>)[key])) {
				return lastResult as R;
			}
		}

		lastValue = value;
		lastResult = selector(value);
		return lastResult;
	};
}

/**
 * Creates a deep equality selector
 * @param selector The selector function
 * @returns A selector that uses deep equality
 */
export function createDeepSelector<T, R>(selector: (value: T) => R): (value: T) => R {
	let lastValue: unknown;
	let lastResult: R | undefined;

	return (value: T) => {
		if (JSON.stringify(lastValue) === JSON.stringify(value)) {
			return lastResult as R;
		}

		lastValue = value;
		lastResult = selector(value);
		return lastResult;
	};
}

/**
 * Composes multiple selectors
 * @param selectors Array of selectors to compose
 * @returns A composed selector function
 */
export function composeSelectors<T, R>(...selectors: Array<(value: T) => R>): (value: T) => R {
	return (value: T) => {
		let result = value;
		for (const selector of selectors) {
			result = selector(result) as unknown as T;
		}
		return result as R;
	};
}
