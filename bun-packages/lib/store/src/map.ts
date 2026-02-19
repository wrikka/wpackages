import { manageLifecycle } from "./services/lifecycle.service";
import type { MapListener, MapStore } from "./types";

/**
 * Creates a new map store, a store for an object.
 * It provides a `setKey` method for updating individual properties.
 * @param initialValue The initial object value.
 * @returns A map store object.
 */
export function map<T extends object>(initialValue: T): MapStore<T> {
	let value = { ...initialValue };
	const listeners = new Set<MapListener<T>>();

	const notify = (oldValue: T, changedKey?: keyof T) => {
		listeners.forEach(l => l(value, oldValue, changedKey));
	};

	const store: MapStore<T> = {
		get: () => value,
		set: (newValue: T) => {
			const oldValue = value;
			value = newValue;
			notify(oldValue);
		},
		setKey: <K extends keyof T>(key: K, newValue: T[K]) => {
			if (value[key] === newValue) return;
			const oldValue = value;
			value = { ...value, [key]: newValue };
			notify(oldValue, key);
		},
		subscribe: (listener: MapListener<T>) => {
			listeners.add(listener);
			manageLifecycle(store, listeners);
			listener(value);
			return () => {
				listeners.delete(listener);
				manageLifecycle(store, listeners);
			};
		},
	};
	return store;
}
