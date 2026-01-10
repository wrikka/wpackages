/**
 * Type utilities for @wpackages/store
 * Helper types for working with stores
 */

import type { Store, MapStore } from "../types";

/**
 * Extracts the value type from a store
 */
export type StoreValue<T extends Store<unknown> | MapStore<object>> = T extends Store<infer V> ? V : T extends MapStore<infer V> ? V : never;

/**
 * Creates a readonly store type
 */
export type ReadonlyStoreType<T> = Pick<Store<T>, "get" | "subscribe">;

/**
 * Creates a writable store type
 */
export type WritableStore<T> = Store<T>;

/**
 * Creates a type for a store with a specific value
 */
export type TypedStore<T> = Store<T>;

/**
 * Creates a type for a map store with specific keys
 */
export type TypedMapStore<T extends object> = MapStore<T>;

/**
 * Creates a union type of all store types
 */
export type AnyStore<T = unknown> = Store<T> | (T extends object ? MapStore<T> : never);

/**
 * Creates a type for store actions
 */
export type StoreAction<T> = (value: T) => T;

/**
 * Creates a type for async store actions
 */
export type AsyncStoreAction<T, Args extends unknown[] = []> = (...args: Args) => Promise<T>;

/**
 * Creates a type for store selectors
 */
export type StoreSelector<T, R> = (value: T) => R;

/**
 * Creates a type for store middleware
 */
export type StoreMiddleware<T> = (store: Store<T>) => Store<T>;

/**
 * Creates a type for store enhancers
 */
export type StoreEnhancer<T> = (storeCreator: () => Store<T>) => Store<T>;

/**
 * Creates a type for partial updates
 */
export type PartialUpdate<T> = Partial<T>;

/**
 * Creates a type for deep partial updates
 */
export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

/**
 * Creates a type for required keys
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Creates a type for optional keys
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Creates a type for a store with loading state
 */
export type LoadingStore<T> = Store<{
	data: T;
	loading: boolean;
	error: Error | null;
}>;

/**
 * Creates a type for a paginated store
 */
export type PaginatedStore<T> = Store<{
	data: T[];
	page: number;
	pageSize: number;
	total: number;
	loading: boolean;
	error: Error | null;
}>;

/**
 * Creates a type for a filtered store
 */
export type FilteredStore<T> = Store<{
	data: T[];
	filter: (item: T) => boolean;
}>;

/**
 * Creates a type for a sorted store
 */
export type SortedStore<T> = Store<{
	data: T[];
	sortBy: keyof T | ((a: T, b: T) => number);
	sortOrder: "asc" | "desc";
}>;

/**
 * Creates a type for a store with history
 */
export type HistoryStore<T> = Store<{
	current: T;
	history: T[];
	future: T[];
}>;

/**
 * Type guard to check if a value is a store
 */
export function isStore<T>(value: unknown): value is Store<T> {
	return (
		typeof value === "object" &&
		value !== null &&
		"get" in value &&
		typeof value.get === "function" &&
		"set" in value &&
		typeof value.set === "function" &&
		"subscribe" in value &&
		typeof value.subscribe === "function"
	);
}

/**
 * Type guard to check if a value is a map store
 */
export function isMapStore<T extends object>(value: unknown): value is MapStore<T> {
	return (
		isStore<T>(value) &&
		"setKey" in value &&
		typeof value.setKey === "function"
	);
}

/**
 * Type guard to check if a value is a readonly store
 */
export function isReadonlyStore<T>(value: unknown): value is ReadonlyStoreType<T> {
	return (
		typeof value === "object" &&
		value !== null &&
		"get" in value &&
		typeof value.get === "function" &&
		"subscribe" in value &&
		typeof value.subscribe === "function" &&
		!("set" in value)
	);
}
