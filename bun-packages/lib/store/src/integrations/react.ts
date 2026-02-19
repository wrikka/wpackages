/**
 * React hooks for @wpackages/store
 */

import { useEffect, useState, useCallback } from "react";
import type { Store, MapStore } from "../types";

/**
 * React hook to subscribe to a store
 * @param store The store to subscribe to
 * @returns The current store value
 */
export function useStore<T>(store: Store<T>): T {
	const [value, setValue] = useState(() => store.get());

	useEffect(() => {
		const unsubscribe = store.subscribe((newValue) => {
			setValue(newValue);
		});
		return unsubscribe;
	}, [store]);

	return value;
}

/**
 * React hook to subscribe to a map store
 * @param store The map store to subscribe to
 * @returns The current store value and a setter function
 */
export function useMapStore<T extends object>(store: MapStore<T>): [T, (value: T) => void] {
	const [value, setValue] = useState(() => store.get());

	useEffect(() => {
		const unsubscribe = store.subscribe((newValue) => {
			setValue(newValue);
		});
		return unsubscribe;
	}, [store]);

	const setStore = useCallback(
		(newValue: T) => {
			store.set(newValue);
		},
		[store],
	);

	return [value, setStore];
}

/**
 * React hook to subscribe to a specific key in a map store
 * @param store The map store to subscribe to
 * @param key The key to subscribe to
 * @returns The current value of the key and a setter function
 */
export function useMapKey<T extends object, K extends keyof T>(
	store: MapStore<T>,
	key: K,
): [T[K], (value: T[K]) => void] {
	const [value, setValue] = useState(() => store.get()[key]);

	useEffect(() => {
		const unsubscribe = store.subscribe((newValue, _, changedKey) => {
			if (changedKey === undefined || changedKey === key) {
				setValue(newValue[key]);
			}
		});
		return unsubscribe;
	}, [store, key]);

	const setKey = useCallback(
		(newValue: T[K]) => {
			store.setKey(key, newValue);
		},
		[store, key],
	);

	return [value, setKey];
}

/**
 * React hook to get a store value without subscribing
 * @param store The store to get value from
 * @returns The current store value
 */
export function useStoreValue<T>(store: Store<T>): T {
	return store.get();
}

/**
 * React hook to get a map store value without subscribing
 * @param store The map store to get value from
 * @returns The current store value
 */
export function useMapStoreValue<T extends object>(store: MapStore<T>): T {
	return store.get();
}

/**
 * React hook to get a specific key from a map store without subscribing
 * @param store The map store to get value from
 * @param key The key to get
 * @returns The current value of the key
 */
export function useMapKeyValue<T extends object, K extends keyof T>(store: MapStore<T>, key: K): T[K] {
	return store.get()[key];
}

/**
 * React hook to create a callback that updates the store
 * @param store The store to update
 * @returns A function to update the store
 */
export function useSetStore<T>(store: Store<T>): (value: T) => void {
	return useCallback(
		(value: T) => {
			store.set(value);
		},
		[store],
	);
}

/**
 * React hook to create a callback that updates a map store
 * @param store The map store to update
 * @returns A function to update the store
 */
export function useSetMapStore<T extends object>(store: MapStore<T>): (value: T) => void {
	return useCallback(
		(value: T) => {
			store.set(value);
		},
		[store],
	);
}

/**
 * React hook to create a callback that updates a specific key in a map store
 * @param store The map store to update
 * @param key The key to update
 * @returns A function to update the key
 */
export function useSetMapKey<T extends object, K extends keyof T>(
	store: MapStore<T>,
	key: K,
): (value: T[K]) => void {
	return useCallback(
		(value: T[K]) => {
			store.setKey(key, value);
		},
		[store, key],
	);
}

/**
 * React hook to subscribe to a computed store
 * @param store The computed store to subscribe to
 * @returns The current computed value
 */
export function useComputed<T>(store: Store<T>): T {
	return useStore(store);
}
