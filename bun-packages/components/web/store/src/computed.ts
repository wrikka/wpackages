import { atom } from "./atom";
import { onMount } from "./services/lifecycle.service";
import type { Listener, ReadonlyStore, Store, Unsubscribe } from "./types";

/**
 * Creates a readonly store that derives its value from other stores.
 * The value is recalculated whenever any of the dependency stores change.
 * @param stores An array of dependency stores.
 * @param computer A function that takes the values of the dependency stores and returns the new value.
 * @returns A readonly store.
 */
export function computed<T, D extends readonly unknown[]>(
	stores: [...{ [K in keyof D]: Store<D[K]> | ReadonlyStore<D[K]> }],
	computer: (...values: { [K in keyof D]: D[K] }) => T,
): ReadonlyStore<T> {
	const derived = atom<T | undefined>(undefined, true);

	onMount(derived, () => {
		const unsubscribes: Unsubscribe[] = stores.map(store =>
			store.subscribe(() => {
				const newValues = stores.map(s => s.get()) as { [K in keyof D]: D[K] };
				derived.set(computer(...newValues));
			})
		);

		return () => {
			unsubscribes.forEach(unsub => unsub());
		};
	});

	return {
		get: () => {
			if (derived.get() === undefined) {
				// If not subscribed yet, compute the value on the fly
				return computer(...(stores.map(s => s.get()) as { [K in keyof D]: D[K] }));
			}
			return derived.get() as T;
		},
		subscribe: (listener: Listener<T>) => {
			const wrappedListener: Listener<T | undefined> = (value, oldValue) => {
				if (value !== undefined) {
					listener(value as T, oldValue);
				}
			};
			return derived.subscribe(wrappedListener);
		},
	};
}
