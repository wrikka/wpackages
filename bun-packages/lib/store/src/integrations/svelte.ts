/**
 * Svelte stores for @wpackages/store
 */

import { derived, writable, type Readable, type Writable } from "svelte/store";
import type { Store, MapStore } from "../types";

/**
 * Converts a @w/store to a Svelte readable store
 * @param store The @w/store to convert
 * @returns A Svelte readable store
 */
export function toSvelteStore<T>(store: Store<T>): Readable<T> {
	return {
		subscribe: (run, _invalidate) => {
			const unsubscribe = store.subscribe((value) => {
				run(value);
			});
			return unsubscribe;
		},
	};
}

/**
 * Converts a @w/map store to a Svelte writable store
 * @param store The @w/map store to convert
 * @returns A Svelte writable store
 */
export function toSvelteMapStore<T extends object>(store: MapStore<T>): Writable<T> {
	const initial = store.get();
	const wStore = writable(initial);

	store.subscribe((value) => {
		wStore.set(value);
	});

	return {
		subscribe: wStore.subscribe,
		set: (value) => {
			store.set(value);
		},
		update: (updater) => {
			const current = store.get();
			const next = updater(current);
			store.set(next);
		},
	};
}

/**
 * Creates a Svelte store from a @w/store with a writable setter
 * @param store The @w/store to convert
 * @returns A Svelte writable store
 */
export function toWritableSvelteStore<T>(store: Store<T>): Writable<T> {
	const initial = store.get();
	const wStore = writable(initial);

	store.subscribe((value) => {
		wStore.set(value);
	});

	return {
		subscribe: wStore.subscribe,
		set: (value) => {
			store.set(value);
		},
		update: (updater) => {
			const current = store.get();
			const next = updater(current);
			store.set(next);
		},
	};
}

/**
 * Creates a derived Svelte store from a @w/store
 * @param store The @w/store to derive from
 * @param fn The derivation function
 * @returns A derived Svelte store
 */
export function deriveFromStore<T, R>(store: Store<T>, fn: (value: T) => R): Readable<R> {
	return derived(toSvelteStore(store), fn);
}

/**
 * Creates a derived Svelte store from multiple @w/stores
 * @param stores Array of @w/stores
 * @param fn The derivation function
 * @returns A derived Svelte store
 */
export function deriveFromStores<T extends unknown[], R>(stores: { [K in keyof T]: Store<T[K]> }, fn: (...values: T) => R): Readable<R> {
	const svelteStores = stores.map((s) => toSvelteStore(s)) as { [K in keyof T]: Readable<T[K]> };
	return derived(svelteStores, fn);
}
