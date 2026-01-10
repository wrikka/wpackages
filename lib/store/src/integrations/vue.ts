/**
 * Vue composables for @wpackages/store
 */

import { ref, computed, onUnmounted, type Ref } from "vue";
import type { Store, MapStore } from "../types";

/**
 * Vue composable to subscribe to a store
 * @param store The store to subscribe to
 * @returns A reactive ref containing the store value
 */
export function useVueStore<T>(store: Store<T>): Ref<T> {
	const value = ref(store.get());

	const unsubscribe = store.subscribe((newValue) => {
		value.value = newValue;
	});

	onUnmounted(unsubscribe);

	return value;
}

/**
 * Vue composable to subscribe to a map store
 * @param store The map store to subscribe to
 * @returns A reactive ref containing the store value and a setter function
 */
export function useVueMapStore<T extends object>(store: MapStore<T>): { value: Ref<T>; set: (value: T) => void } {
	const value = ref(store.get());

	const unsubscribe = store.subscribe((newValue) => {
		value.value = newValue;
	});

	onUnmounted(unsubscribe);

	const set = (newValue: T) => {
		store.set(newValue);
	};

	return { value, set };
}

/**
 * Vue composable to subscribe to a specific key in a map store
 * @param store The map store to subscribe to
 * @param key The key to subscribe to
 * @returns A reactive ref containing the key value and a setter function
 */
export function useVueMapKey<T extends object, K extends keyof T>(
	store: MapStore<T>,
	key: K,
): { value: Ref<T[K]>; set: (value: T[K]) => void } {
	const value = ref(store.get()[key]);

	const unsubscribe = store.subscribe((newValue, _, changedKey) => {
		if (changedKey === undefined || changedKey === key) {
			value.value = newValue[key];
		}
	});

	onUnmounted(unsubscribe);

	const set = (newValue: T[K]) => {
		store.setKey(key, newValue);
	};

	return { value, set };
}

/**
 * Vue composable to get a store value without subscribing
 * @param store The store to get value from
 * @returns The current store value
 */
export function useVueStoreValue<T>(store: Store<T>): T {
	return store.get();
}

/**
 * Vue composable to get a map store value without subscribing
 * @param store The map store to get value from
 * @returns The current store value
 */
export function useVueMapStoreValue<T extends object>(store: MapStore<T>): T {
	return store.get();
}

/**
 * Vue composable to get a specific key from a map store without subscribing
 * @param store The map store to get value from
 * @param key The key to get
 * @returns The current value of the key
 */
export function useVueMapKeyValue<T extends object, K extends keyof T>(store: MapStore<T>, key: K): T[K] {
	return store.get()[key];
}

/**
 * Vue composable to create a computed value from a store
 * @param store The store to derive from
 * @param selector A function to select/transform the value
 * @returns A computed ref
 */
export function useVueStoreSelector<T, R>(store: Store<T>, selector: (value: T) => R): Ref<R> {
	return computed(() => selector(store.get()));
}

/**
 * Vue composable to create a computed value from a map store
 * @param store The map store to derive from
 * @param selector A function to select/transform the value
 * @returns A computed ref
 */
export function useVueMapStoreSelector<T extends object, R>(store: MapStore<T>, selector: (value: T) => R): Ref<R> {
	return computed(() => selector(store.get()));
}
