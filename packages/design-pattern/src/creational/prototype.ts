/**
 * Prototype Pattern - Pure functional implementation
 * Creates new objects by cloning existing ones
 */

/**
 * Deep clone an object (pure functional way)
 */
export const clone = <T>(obj: T): T => {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as T;
	}

	if (obj instanceof Array) {
		return obj.map((item) => clone(item)) as T;
	}

	if (obj instanceof Map) {
		return new Map(
			Array.from(obj.entries()).map(([key, value]) => [key, clone(value)]),
		) as T;
	}

	if (obj instanceof Set) {
		return new Set(Array.from(obj.values()).map((value) => clone(value))) as T;
	}

	if (obj instanceof Object) {
		const cloned = {} as T;
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				cloned[key] = clone(obj[key]);
			}
		}
		return cloned;
	}

	return obj;
};

/**
 * Shallow clone an object
 */
export const shallowClone = <T extends object>(obj: T): T => {
	if (Array.isArray(obj)) {
		return [...obj] as T;
	}
	return { ...obj };
};

/**
 * Create a prototype factory
 */
export const createPrototype = <T>(prototype: T) => ({
	clone: (): T => clone(prototype),
	shallowClone: (): T => shallowClone(prototype as object) as T,
	cloneWith: (overrides: Partial<T>): T =>
		({
			...(clone(prototype) as object),
			...(overrides as object),
		}) as T,
});

/**
 * Create a prototype registry
 */
export const createPrototypeRegistry = <T>(): {
	readonly register: (key: string, prototype: T) => void;
	readonly clone: (key: string) => T;
	readonly cloneWith: (key: string, overrides: Partial<T>) => T;
	readonly has: (key: string) => boolean;
	readonly keys: () => readonly string[];
} => {
	const prototypes = new Map<string, T>();

	return {
		register: (key: string, prototype: T): void => {
			prototypes.set(key, prototype);
		},
		clone: (key: string): T => {
			const prototype = prototypes.get(key);
			if (!prototype) {
				throw new Error(`Prototype not found: ${key}`);
			}
			return clone(prototype);
		},
		cloneWith: (key: string, overrides: Partial<T>): T => {
			const prototype = prototypes.get(key);
			if (!prototype) {
				throw new Error(`Prototype not found: ${key}`);
			}
			return {
				...(clone(prototype) as object),
				...(overrides as object),
			} as T;
		},
		has: (key: string): boolean => prototypes.has(key),
		keys: (): readonly string[] => Array.from(prototypes.keys()),
	};
};

/**
 * Create a typed prototype with defaults
 */
export const createTypedPrototype = <T extends Record<string, unknown>>(
	defaults: T,
) => ({
	create: (overrides: Partial<T> = {}): T => ({
		...clone(defaults),
		...overrides,
	}),
	extend: <TExtended extends Record<string, unknown>>(
		extensions: TExtended,
	): T & TExtended => ({
		...clone(defaults),
		...extensions,
	}),
});

/**
 * Merge multiple prototypes
 */
export const mergePrototypes = <T extends Record<string, unknown>>(
	...prototypes: readonly T[]
): T => {
	return prototypes.reduce(
		(acc, prototype) => ({
			...acc,
			...clone(prototype),
		}),
		{} as T,
	);
};

/**
 * Create a hierarchical prototype (with parent-child relationship)
 */
export const createHierarchicalPrototype = <T extends Record<string, unknown>>(
	parent: T,
) => ({
	child: <TChild extends Record<string, unknown>>(
		childProps: TChild,
	): T & TChild => ({
		...clone(parent),
		...childProps,
	}),
	extend: (overrides: Partial<T>): T => ({
		...clone(parent),
		...overrides,
	}),
});
