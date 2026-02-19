// Core types
/**
 * A listener function that receives the new and optional old value of a store.
 * @param value The new value.
 * @param oldValue The previous value (optional).
 */
export type Listener<T> = (value: T, oldValue?: T) => void;
/**
 * A function to unsubscribe a listener from a store.
 */
export type Unsubscribe = () => void;

/**
 * A basic store for holding a single value (atom).
 */
export interface BaseStore {
	onMount?: () => (() => void) | void;
	onUnmount?: () => void;
}

/**
 * A basic store for holding a single value (atom).
 */
export interface Store<T> extends BaseStore {
	get(): T;
	set(value: T): void;
	subscribe(listener: Listener<T>): Unsubscribe;
}

// Map Store types
/**
 * A listener for map stores, which also receives the key that was changed.
 * @param value The new map value.
 * @param oldValue The previous map value (optional).
 * @param changedKey The key that was changed (optional).
 */
export type MapListener<T extends object> = (value: T, oldValue?: T, changedKey?: keyof T) => void;

/**
 * A store for holding object values, with helpers to update specific keys.
 */
export interface MapStore<T extends object> extends BaseStore {
	get(): T;
	set(value: T): void;
	setKey<K extends keyof T>(key: K, value: T[K]): void;
	subscribe(listener: MapListener<T>): Unsubscribe;
}

// Computed Store types
/**
 * A readonly version of a store, used for computed values.
 */
export interface ReadonlyStore<T> {
	get(): T;
	subscribe(listener: Listener<T>): Unsubscribe;
}
