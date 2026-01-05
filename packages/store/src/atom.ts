import { manageLifecycle } from './services/lifecycle.service';
import type { Store, Listener } from './types';

/**
 * Creates a new atom, a store for a single value.
 * Atoms are the smallest reactive unit in the store.
 * @param initialValue The initial value of the atom.
 * @returns A store object with get, set, subscribe, and listen methods.
 */
export function atom<T>(initialValue: T, lazy = false): Store<T> {
	let value = initialValue;
	const listeners = new Set<Listener<T>>();

	const store: Store<T> = {
		get: () => value,
		set: (newValue: T) => {
			if (newValue === value) return;
			const oldValue = value;
			value = newValue;
			listeners.forEach(l => l(value, oldValue));
		},
		subscribe: (listener: Listener<T>) => {
			listeners.add(listener);
			manageLifecycle(store, listeners);
			if (!lazy) {
				listener(value);
			}
			return () => {
				listeners.delete(listener);
				manageLifecycle(store, listeners);
			};
		},
	};
	return store;
}
