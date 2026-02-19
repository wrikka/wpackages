/**
 * Nested state helpers for @wpackages/store
 * Utilities for working with nested object states
 */

import type { MapStore } from "../types";

export type Path = (string | number)[];

/**
 * Gets a value from a nested object using a path
 * @param obj The object to get from
 * @param path The path to the value
 * @returns The value at the path, or undefined if not found
 */
export function getNestedValue<T>(obj: T, path: Path): unknown {
	return path.reduce((current, key) => {
		if (current && typeof current === "object" && key in current) {
			return (current as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj as unknown);
}

/**
 * Sets a value in a nested object using a path
 * @param obj The object to modify
 * @param path The path to the value
 * @param value The value to set
 * @returns A new object with the value set
 */
export function setNestedValue<T>(obj: T, path: Path, value: unknown): T {
	if (path.length === 0) {
		return value as T;
	}

	const [key, ...rest] = path;
	const current = obj as Record<string, unknown>;

	if (rest.length === 0) {
		const result = { ...current };
		result[key as string] = value;
		return result as T;
	}

	const result = { ...current };
	result[key as string] = setNestedValue(current[key] as T, rest, value);
	return result as T;
}

/**
 * Updates a value in a nested object using a path and an updater function
 * @param obj The object to modify
 * @param path The path to the value
 * @param updater The function to update the value
 * @returns A new object with the value updated
 */
export function updateNestedValue<T>(obj: T, path: Path, updater: (value: unknown) => unknown): T {
	const currentValue = getNestedValue(obj, path);
	const newValue = updater(currentValue);
	return setNestedValue(obj, path, newValue);
}

/**
 * Creates a store that supports nested state operations
 * @param store The store to enhance
 * @returns A store with nested state helpers
 */
export function withNestedState<T extends object>(
	store: MapStore<T>,
): MapStore<T> & {
	getNested: (path: Path) => unknown;
	setNested: (path: Path, value: unknown) => void;
	updateNested: (path: Path, updater: (value: unknown) => unknown) => void;
} {
	return {
		get: store.get.bind(store),
		set: store.set.bind(store),
		setKey: store.setKey.bind(store),
		subscribe: store.subscribe.bind(store),
		getNested: (path: Path) => {
			return getNestedValue(store.get(), path);
		},
		setNested: (path: Path, value: unknown) => {
			const current = store.get();
			const next = setNestedValue(current, path, value);
			store.set(next);
		},
		updateNested: (path: Path, updater: (value: unknown) => unknown) => {
			const current = store.get();
			const next = updateNestedValue(current, path, updater);
			store.set(next);
		},
	};
}

/**
 * Merges nested objects
 * @param target The target object
 * @param source The source object to merge
 * @returns A new merged object
 */
export function mergeNested<T extends object>(target: T, source: Partial<T>): T {
	const result = { ...target };

	for (const key in source) {
		const sourceValue = source[key];
		const targetValue = result[key];

		if (
			sourceValue &&
			targetValue &&
			typeof sourceValue === "object" &&
			!Array.isArray(sourceValue) &&
			typeof targetValue === "object" &&
			!Array.isArray(targetValue)
		) {
			result[key] = mergeNested(targetValue as object, sourceValue as object) as T[Extract<keyof T, string>];
		} else {
			result[key] = sourceValue as T[Extract<keyof T, string>];
		}
	}

	return result;
}

/**
 * Creates a store with merge functionality
 * @param store The store to enhance
 * @returns A store with merge functionality
 */
export function withMerge<T extends object>(
	store: MapStore<T>,
): MapStore<T> & {
	merge: (value: Partial<T>) => void;
} {
	return {
		get: store.get.bind(store),
		set: store.set.bind(store),
		setKey: store.setKey.bind(store),
		subscribe: store.subscribe.bind(store),
		merge: (value: Partial<T>) => {
			const current = store.get();
			const next = mergeNested(current, value);
			store.set(next);
		},
	};
}
