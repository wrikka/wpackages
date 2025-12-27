/**
 * Singleton Pattern - Pure functional implementation using closures
 * Ensures only one instance exists
 */

import type { Factory } from "../types";
import { createLazyRegistry } from "../components";

/**
 * Create a singleton factory
 */
export const createSingleton = <T>(factory: Factory<void, T>): Factory<void, T> => {
	let instance: T | undefined;

	return (): T => {
		if (instance === undefined) {
			instance = factory();
		}
		return instance;
	};
};

/**
 * Create a lazy singleton (initialized on first access)
 */
export const createLazySingleton = <T>(
	factory: Factory<void, T>,
): Factory<void, T> => {
	let instance: T | undefined;
	let initialized = false;

	return (): T => {
		if (!initialized) {
			instance = factory();
			initialized = true;
		}
		return instance as T;
	};
};

/**
 * Create a singleton with reset capability
 */
export const createResettableSingleton = <T>(
	factory: Factory<void, T>,
): {
	readonly getInstance: Factory<void, T>;
	readonly reset: () => void;
	readonly hasInstance: () => boolean;
} => {
	let instance: T | undefined;

	return {
		getInstance: (): T => {
			if (instance === undefined) {
				instance = factory();
			}
			return instance;
		},
		reset: (): void => {
			instance = undefined;
		},
		hasInstance: (): boolean => instance !== undefined,
	};
};

/**
 * Create a singleton registry (named singletons)
 */
export const createSingletonRegistry = <T>(): {
	readonly get: (key: string, factory: Factory<void, T>) => T;
	readonly has: (key: string) => boolean;
	readonly clear: (key?: string) => void;
	readonly keys: () => readonly string[];
} => {
	const registry = createLazyRegistry<T>(() => {
		throw new Error("Factory not provided for key");
	});

	const factories = new Map<string, Factory<void, T>>();

	return {
		get: (key: string, factory: Factory<void, T>): T => {
			factories.set(key, factory);
			return registry.get(key);
		},
		has: (key: string): boolean => registry.has(key),
		clear: (key?: string): void => {
			if (key) {
				factories.delete(key);
			} else {
				factories.clear();
			}
		},
		keys: (): readonly string[] => registry.keys(),
	};
};

/**
 * Create a thread-safe singleton (for multi-threaded environments)
 */
export const createThreadSafeSingleton = <T>(
	factory: Factory<void, T>,
): Factory<void, T> => {
	let instance: T | undefined;
	let lock = false;

	return (): T => {
		// Double-check locking pattern
		if (instance === undefined) {
			while (lock) {
				// Wait for lock to be released
			}
			lock = true;
			if (instance === undefined) {
				instance = factory();
			}
			lock = false;
		}
		return instance;
	};
};

/**
 * Create a parameterized singleton (singleton per parameter)
 */
export const createParameterizedSingleton = <TParam extends string | number, T>(
	factory: Factory<TParam, T>,
): Factory<TParam, T> => {
	const instances = new Map<TParam, T>();

	return (param: TParam): T => {
		if (!instances.has(param)) {
			instances.set(param, factory(param));
		}
		return instances.get(param) as T;
	};
};
